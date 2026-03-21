---
title: Adding API Endpoints
sidebar_label: Adding API Endpoints
---

# Adding API Endpoints

This guide covers how to introduce a new API endpoint in the `ari/core` Symfony/API Platform application, from choosing the right implementation strategy to writing the mandatory test suite.

---

## 1. Decision Tree: Which approach should I use?

Before writing any code, decide which mechanism fits the endpoint.

### Use `#[ApiResource]` on the Entity (standard CRUD)

Use this when the endpoint exposes **standard CRUD operations** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) on an existing Doctrine entity with no significant server-side computation. API Platform generates the routes, serialization, and persistence automatically.

```php
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('VIEW', object)"),
        new Post(security: "is_granted('ROLE_USER')"),
        new Patch(security: "is_granted('EDIT', object)"),
        new Delete(security: "is_granted('DELETE', object)"),
    ],
)]
class Contact { ... }
```

The built-in `TenantFilter` (a Doctrine SQL filter) automatically scopes collection queries to the authenticated user's tenant — no additional WHERE clause is needed for collection operations.

### Use a Custom StateProvider (computed or aggregated responses)

Use a custom [`ProviderInterface`](https://api-platform.com/docs/core/state-providers/) when:

- The response is **computed or aggregated** from multiple sources (e.g. `NeedsAttentionProvider` merges a cadence-overdue DQL query with task-overdue contact IDs in PHP, then applies PHP-level pagination).
- The data does not map cleanly to a single entity row.
- You need full control over hydration order to avoid N+1 queries.

Wire the provider on an `#[ApiResource]` using the `provider:` key:

```php
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/contacts/needs-attention',
            provider: NeedsAttentionProvider::class,
            security: "is_granted('ROLE_USER')",
        ),
    ],
)]
class NeedsAttentionContactDto { ... }
```

The provider class must implement `ProviderInterface` and be registered in the Symfony container (autowiring handles this automatically for classes in `src/State/`).

### Use a Custom Controller (non-REST operations only)

Use a plain Symfony controller only when the operation does not fit REST semantics:

- File upload / download
- Webhooks receiving data from external services
- Complex multi-step workflows that must return HTTP codes other than 200/201/204

Wire the controller on an operation using `controller:`:

```php
new Post(
    uriTemplate: '/contacts/import/sms',
    controller: SmsImportController::class,
)
```

Keep controllers thin. Extract all business logic into a Service class in `src/Service/`.

---

## 2. Firewall Gotcha: Never use `/api/login` as an endpoint prefix

This is a critical pitfall. The security firewall in `config/packages/security.yaml` matches routes in order:

| Priority | Firewall   | Pattern                                | Auth method     |
|----------|------------|----------------------------------------|-----------------|
| 1        | `dev`      | `^/(_profiler\|_wdt\|assets\|build)/` | none (disabled) |
| 2        | `metrics`  | `^/metrics$`                           | none (disabled) |
| 3        | `login`    | `^/api/login`                          | `json_login`    |
| 4        | `refresh`  | `^/api/token/refresh`                  | `refresh_jwt`   |
| 5        | `api`      | `^/api`                                | JWT + ApiKey    |
| 6        | `main`     | (catch-all)                            | JWT             |

**If you create an endpoint whose URL starts with `/api/login`**, it will be matched by the `login` firewall (which uses `json_login`, not JWT). The request will be processed by the `json_login` authenticator, which expects form credentials, and will return `401` even when the client supplies a valid JWT Bearer token.

**Never do this:**

```
/api/login-history     ← matched by login firewall, returns 401 with valid JWT
/api/login_attempts    ← same problem
```

**Use these patterns instead:**

```
/api/auth_history      ← matched by api firewall, JWT works correctly
/api/sessions          ← matched by api firewall, JWT works correctly
/api/auth/...          ← matched by api firewall, JWT works correctly
```

---

## 3. Security Attributes

Every operation must declare its security expression. Choose based on the operation type:

### Collection operations

For `GetCollection`, grant access to any authenticated user. Tenant isolation is handled automatically by the Doctrine `TenantFilter` for entity-backed resources:

```php
new GetCollection(security: "is_granted('ROLE_USER')")
```

### Item operations

For `Get`, `Patch`, `Put`, and `Delete`, you must use a **Voter**. The `object` variable refers to the entity instance loaded by API Platform:

```php
new Get(security: "is_granted('VIEW', object)")
new Patch(security: "is_granted('EDIT', object)")
new Delete(security: "is_granted('DELETE', object)")
```

Voters live in `src/Security/Voter/`. Each Voter receives the attribute string (e.g. `'VIEW'`) and the subject object, and returns `ACCESS_GRANTED` or `ACCESS_DENIED`. The Voter is responsible for verifying that the requesting user is the tenant owner.

### Role hierarchy

`ROLE_ADMIN` inherits `ROLE_USER` (configured in `config/packages/security.yaml`). Admin users pass `is_granted('ROLE_USER')` checks automatically.

---

## 4. Tenant Isolation in Custom StateProviders

The automatic `TenantFilter` only applies to queries run through the standard Doctrine repository methods. When you write raw DQL or use `EntityManagerInterface::createQueryBuilder()` inside a custom StateProvider, **you must add the user filter manually**.

Always scope DQL queries to the authenticated user:

```php
$user = $this->security->getUser();
if (!$user instanceof User) {
    return new TraversablePaginator(new \ArrayIterator([]), 1, $itemsPerPage, 0);
}

$rows = $this->em->createQueryBuilder()
    ->select('c')
    ->from(Contact::class, 'c')
    ->where('c.user = :user')       // mandatory tenant scope
    ->setParameter('user', $user)
    ->getQuery()
    ->getResult();
```

Failing to add this clause would allow any authenticated user to access other users' data. See `src/State/NeedsAttentionProvider.php` for a complete example, including PHP-level pagination over merged result sets.

For a second IN-query step (loading entities by ID after PHP-level filtering), always add the user check there too:

```php
->where('c.id IN (:ids)')
->andWhere('c.user = :user')   // defense-in-depth: prevents cross-tenant ID injection
->setParameter('ids', $pageIds)
->setParameter('user', $user)
```

---

## 5. Writing Tests (Mandatory)

Every new endpoint requires a functional test class in `tests/Functional/`. Use `NeedsAttentionApiTest.php` or `ContactApiTest.php` as references.

The mandatory test scenarios are:

| Scenario | What to assert |
|---|---|
| Happy path | Authenticated request returns `200`/`201`, response body has the expected shape and data |
| `401` without token | Request with no `Authorization` header returns `401` |
| `403` wrong tenant | User B requesting User A's resource IRI returns `403` |
| Tenant isolation for collections | User B's collection response does not include any of User A's items |
| Pagination | If the endpoint supports pagination, verify `hydra:totalItems`, `hydra:view`, and page boundaries |

Example test structure:

```php
class MyResourceApiTest extends ApiTestCase
{
    public function testGetCollectionReturnsOnlyOwnItems(): void
    {
        $userA = $this->createUser('a@example.com');
        $userB = $this->createUser('b@example.com');
        $this->createResource($userA);
        $this->createResource($userB);

        $response = $this->request('GET', '/api/my-resources', userA: true);

        self::assertResponseIsSuccessful();
        $data = $response->toArray();
        self::assertCount(1, $data['hydra:member']);
    }

    public function testGetCollectionRequiresAuth(): void
    {
        $this->request('GET', '/api/my-resources');
        self::assertResponseStatusCodeSame(401);
    }

    public function testGetItemForbiddenForWrongTenant(): void
    {
        $userA = $this->createUser('a@example.com');
        $resource = $this->createResource($userA);
        $userB = $this->createUser('b@example.com');

        $this->requestAsUser('GET', '/api/my-resources/' . $resource->getId(), $userB);
        self::assertResponseStatusCodeSame(403);
    }
}
```

---

## 6. Cache Clearing

After adding or modifying an `#[ApiResource]` attribute, API Platform's metadata cache must be cleared inside the Docker container:

```bash
docker compose exec php php bin/console cache:clear
```

If the endpoint does not appear in the API docs at `/api/docs`, or if route matching behaves unexpectedly, a stale cache is the first thing to check.

---

## 7. Rate Limiting

If the new endpoint is abuse-prone (e.g. expensive AI operations, file uploads, or operations that mutate many rows), add a rate limiter.

**Step 1** — Add a limiter factory entry in `config/packages/rate_limiter.yaml`:

```yaml
framework:
    rate_limiter:
        my_new_endpoint:
            policy: token_bucket
            limit: 20
            rate:
                interval: '1 hour'
                amount: 20
```

Also add a `no_limit` override under `when@test:` to prevent limiter interference in the test suite.

**Step 2** — Register the check in `src/EventSubscriber/JwtUserRateLimiterSubscriber.php`. Follow the existing pattern: match the request path, consume a token from the factory, and return `429` if the limit is exceeded.

Existing limiters in `config/packages/rate_limiter.yaml` for reference:

| Limiter key | Policy | Limit |
|---|---|---|
| `ai_requests` | sliding_window | 60 / minute |
| `api_key_requests` | sliding_window | 1 000 / hour |
| `telegram_outbound` | token_bucket | 25 / second |
| `playbook_activation` | token_bucket | 20 / hour |
| `task_completion` | token_bucket | 200 / hour |
| `sms_import` | token_bucket | 5 / day |
