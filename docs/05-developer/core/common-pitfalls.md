---
title: Common Pitfalls
sidebar_label: Common Pitfalls
---

# Common Pitfalls

This page documents recurring mistakes that have caused bugs or security regressions in the Ari backend. Read it before implementing a new feature; re-read it during code review.

---

## 1. Firewall Naming Trap

**Symptom:** A new endpoint returns `401 Unauthorized` even when a valid JWT token is sent.

**Cause:** Symfony evaluates firewall rules in order. The `login` firewall in `security.yaml` matches the pattern `^/api/login` and uses `json_login` — not JWT. Any endpoint whose URI begins with `/api/login` hits this firewall and cannot be authenticated with a Bearer token.

```
Firewall order:
  1. dev     — ^/(_profiler|_wdt|assets|build)/
  2. login   — ^/api/login   ← json_login, NO JWT
  3. refresh — ^/api/token/refresh
  4. api     — ^/api         ← JWT authentication
```

**Example:** `/api/login_history` matches firewall #2, not #4 → 401 with a valid JWT.

**Rule:** Never start an API endpoint with `/api/login`. Use an alternative prefix:
- `/api/auth_history` instead of `/api/login_history`
- `/api/session_events` instead of `/api/login_events`

**Note:** `GET /metrics` is intentionally placed _outside_ the `/api` prefix entirely and uses a controller-level token check — it is unaffected by this trap.

---

## 2. Cache Clearing After Route Changes

**Symptom:** A newly added `#[ApiResource]` or a modified route returns `404 Not Found`, but `php bin/console debug:router` shows the route exists.

**Cause:** Symfony's router cache is stale. The development container caches compiled routing tables; adding or modifying routes does not automatically invalidate the cache.

**Fix:** Clear the cache in the running container:

```bash
docker exec ari-app-1 bash -c "cd /app/core && php bin/console cache:clear"
```

**When this applies:**
- After adding a new `#[ApiResource]` class.
- After changing `uriTemplate` on an existing operation.
- After adding a new `#[Route]` to a controller.
- After changing `deptrac.yaml` or other config files that affect compiled containers.

---

## 3. LIBXML_NONET Guard in XML Parsing

**Symptom:** Not a crash — this is a security regression that may not be immediately visible.

**Cause:** Parsing user-supplied XML without XXE protection allows Server-Side Request Forgery (SSRF) and local file disclosure attacks. This affects SMS backup imports and any other feature that accepts XML from end users.

**Rule:** When parsing user-supplied XML:
- Always pass `LIBXML_NONET` to prevent network requests during parsing.
- Always set `SUBST_ENTITIES = false` (or equivalent) to prevent entity expansion.
- Never add `LIBXML_NOENT` — this flag _enables_ entity substitution and is an XXE vector.

```php
// Correct
$reader = new \XMLReader();
$reader->open($filePath, null, LIBXML_NONET);

// Also correct (DOMDocument)
libxml_set_external_entity_loader(null);
$dom = new \DOMDocument();
$dom->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR);
```

Do not regress this guard under any circumstances, including "performance" or "compatibility" justifications.

---

## 4. TenantFilter on List Endpoints

**Symptom:** A list endpoint (`GetCollection`) returns data belonging to another user.

**Cause:** List endpoints in Ari rely **solely** on `TenantFilter` (a Doctrine SQL filter) for tenant isolation. The filter automatically appends `AND tenant_id = <current_user_id>` to all queries — but only when enabled and only when a `QueryBuilder` / DQL path is used.

`TenantFilterConfigurator` enables the filter at priority 1 on every HTTP request. However, certain patterns bypass it:

- `$entityManager->find($id)` — bypasses the filter; returns the entity regardless of tenant.
- `$repository->findOneBy(['id' => $id])` — same issue when `tenant` is not in the criteria.

**Rule:**

- Never disable `TenantFilter` inside an HTTP request context — doing so exposes all list endpoints to cross-tenant data leakage.
- Always include `'tenant' => $user` in `findOneBy` criteria for owned entities:

```php
// Unsafe — TenantFilter not guaranteed to apply
$contact = $repo->findOneBy(['id' => $id]);

// Safe
$contact = $repo->findOneBy(['id' => $id, 'tenant' => $user]);
```

- `TenantFilter` may be disabled in console commands, CLI-only services (e.g., `E2eSeedService`), and test fixtures — document it explicitly when you do.

---

## 5. Voter Required on Detail and Mutate Endpoints

**Symptom:** A logged-in user can read or modify another user's entity by guessing its integer ID.

**Cause:** Using `security: "is_granted('ROLE_USER')"` on a `Get`, `Patch`, `Put`, or `Delete` operation only verifies that the caller is authenticated. It does not verify that the caller _owns_ the entity. `TenantFilter` provides SQL-level isolation for `QueryBuilder`/DQL queries, but it does not apply to `find()` / `findOneBy()` calls made without a `QueryBuilder`.

**Rule:** Every operation that exposes or mutates a single entity **must** use a Voter-based security attribute:

```php
// Correct
#[Get(security: "is_granted('CONTACT_VIEW', object)")]
#[Patch(security: "is_granted('CONTACT_EDIT', object)")]
#[Delete(security: "is_granted('CONTACT_EDIT', object)")]

// Wrong on a detail endpoint — ROLE_USER only checks authentication
#[Get(security: "is_granted('ROLE_USER')")]
```

`GetCollection` operations use `ROLE_USER` because no object is available at collection time — `TenantFilter` handles isolation there.

---

## 6. `skipAlphanumeric` in SMS Import

**Symptom:** The `skipAlphanumeric` option in `/api/sms_backup/import` appears to be ignored.

**Cause:** The backend checks the raw form field value as a string:

```php
$skipAlphanumeric = 'false' !== $skipAlphanumericRaw;
```

This means only the exact string `'false'` sets the flag to `false`. Sending `'0'`, `''`, or any other falsy value is treated as `true` (skip alphanumeric numbers).

**Rule:** Always send the string `'true'` or `'false'` as the form field value — not `'1'`/`'0'`, `true`/`false` (booleans), or empty string. This applies to the frontend mutation hook and any API client sending this field.

---

## 7. DQL Field Injection

**Symptom:** A security vulnerability — user-controlled field names used to construct DQL/SQL queries enable column enumeration or query manipulation.

**Cause:** Doctrine's query builder does not parameterize _field names_ (only values). Interpolating a user-supplied field name directly into DQL or a `QueryBuilder` expression is unsafe.

**Example of the unsafe pattern:**

```php
// Unsafe — $field comes from request input
$qb->select("DISTINCT e.$field")->from(MyEntity::class, 'e');
```

**Rule:** Always validate field names against a whitelist before interpolating:

```php
private const ALLOWED_FIELDS = ['type', 'initiator', 'status'];

if (!in_array($field, self::ALLOWED_FIELDS, true)) {
    throw new \InvalidArgumentException("Invalid field: $field");
}
// Now safe to interpolate
$qb->select("DISTINCT e.$field");
```

Alternatively, use a regex guard as a belt-and-suspenders check:

```php
if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $field)) {
    throw new \InvalidArgumentException("Invalid field: $field");
}
```

Do not rely on the regex alone — always use an explicit allowlist when possible.

---

## 8. Transaction Scope and Quota Lock

**Symptom:** Under concurrent requests, quota limits are exceeded — two requests each read "quota not exceeded", both insert, and the user ends up with more records than their plan allows.

**Cause:** The check-then-insert pattern is a classic TOCTOU (time-of-check / time-of-use) race condition. Without a database-level lock, two concurrent requests can both pass the quota check before either insert commits.

**Rule:** Wrap the entire quota check and insert in a transaction with a pessimistic write lock:

```php
$connection->beginTransaction();
try {
    // SELECT FOR UPDATE — blocks concurrent reads until this transaction commits
    $qb->setLockMode(LockMode::PESSIMISTIC_WRITE);
    $count = $qb->getQuery()->getSingleScalarResult();

    if ($count >= $limit) {
        $connection->rollBack();
        throw new QuotaExceededException();
    }

    $em->persist($newEntity);
    $em->flush();
    $connection->commit();
} catch (\Throwable $e) {
    $connection->rollBack();
    throw $e;
}
```

**SQLite caveat:** SQLite does not support `SELECT FOR UPDATE`. Detect the platform and use a compensating transaction instead:

```php
use Doctrine\DBAL\Platforms\SqlitePlatform;

if ($connection->getDatabasePlatform() instanceof SqlitePlatform) {
    // Use BEGIN IMMEDIATE or an application-level lock
}
```

---

## 9. Env Var Quota Overrides

**Symptom:** The application throws `\LogicException` at startup or during a request when a quota-related env var is set.

**Cause:** Quota override env vars (e.g., `APP_CONTACTS_LIMIT_SELF_HOSTED`) must be non-negative integers. The service that reads them validates with:

```php
if (!is_numeric($value) || (int) $value < 0) {
    throw new \LogicException("Invalid quota value for APP_CONTACTS_LIMIT_SELF_HOSTED: '$value'");
}
```

**Common mistakes:**
- Setting the var to an empty string.
- Setting it to a negative number (e.g., `-1` as a "disable" signal — use a dedicated `0` or omit the var instead).
- Setting it to a float string like `'100.5'`.

**Rule:** Quota env vars must be set to a non-negative integer string (`'0'`, `'100'`, `'500'`) or left unset to use the hardcoded default.

---

## 10. Messenger Worker State

**Symptom:** Event listeners that accumulate state (e.g., collecting pending updates to batch-flush at the end of a request) produce incorrect results when running inside a Symfony Messenger worker — data from one message "leaks" into the next.

**Cause:** Messenger workers are long-running processes. Event listeners are registered as services (usually singletons). Any in-memory state accumulated during one message dispatch is still present when the next message is processed, unless explicitly reset.

**Rule:** Any event listener or subscriber that accumulates in-request state must implement `Symfony\Contracts\Service\ResetInterface`:

```php
use Symfony\Contracts\Service\ResetInterface;

class MyAccumulatingListener implements ResetInterface
{
    private array $pendingUpdates = [];

    public function reset(): void
    {
        $this->pendingUpdates = [];
    }
}
```

Symfony Messenger calls `reset()` on all services implementing `ResetInterface` between messages. Without this, accumulated state from one message will corrupt the next.

This applies to: event subscribers, event listeners, services holding request-scoped caches, and any service that builds up state in response to Doctrine events.
