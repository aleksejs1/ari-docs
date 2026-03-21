---
title: Adding Services
sidebar_label: Adding Services
---

# Adding Services

This guide explains where business logic should live, how to name and structure service classes, how Symfony dependency injection works in this codebase, and what the Deptrac layer rules permit.

---

## 1. Where Does Business Logic Live?

| Location | Purpose |
|---|---|
| `src/Service/` | Reusable business logic. The primary home for domain rules, algorithms, and orchestration. |
| `src/State/` | API-layer wiring only. Providers and Processors should be thin: they resolve the current user, call services, and return/persist the result. |
| `src/MessageHandler/` | Symfony Messenger handlers. Handle one message type each; delegate heavy logic to Services. |
| `src/EventListener/` / `src/EventSubscriber/` | Respond to Doctrine or Symfony events. Should be thin and call Services for any non-trivial work. |
| `src/Controller/` | Non-REST entry points only (file upload, webhooks). Always delegate to Services. |

**The key rule:** Processors (`src/State/`) are API-layer wiring. They should call a Service for anything more than trivial property assignment. For example, `ContactProcessor` calls `EntitlementServiceInterface::checkQuota()` and `ContactRepository::countByTenantWithLock()` rather than implementing quota logic itself.

---

## 2. Naming Conventions

| Pattern | Use for |
|---|---|
| `{Domain}Service.php` | Stateless services encapsulating business logic for a domain area (e.g. `EntitlementService`, `SmsBackupImportService`). |
| `{Domain}Repository.php` | Data access objects extending Doctrine's `ServiceEntityRepository`. One per entity. |
| `{Domain}ServiceInterface.php` | An interface for a service that has multiple implementations or whose concrete class should be hidden from callers. |

**Interface + implementation split** — only introduce an interface when:

- There are (or will be) multiple concrete implementations, **or**
- Mocking the interface in unit tests provides a significant benefit (e.g. `EntitlementServiceInterface` is mocked in processor tests to avoid database setup).

When in doubt, start with a concrete class. Adding an interface later is straightforward.

---

## 3. Dependency Injection

Symfony autowires services by **type**. Use constructor injection exclusively.

### Basic constructor injection

```php
final class MyFeatureService
{
    public function __construct(
        private readonly ContactRepository $contactRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
    ) {}
}
```

No configuration is required. Symfony resolves the dependencies automatically from the type hints.

### Named services: `#[Autowire(service: '...')]`

When multiple implementations of the same interface exist and you need a specific one, use the `#[Autowire]` attribute:

```php
use Symfony\Component\DependencyInjection\Attribute\Autowire;

public function __construct(
    #[Autowire(service: UserOwnerProcessor::class)]
    private ProcessorInterface $userOwnerProcessor,
) {}
```

### Parameters: `#[Autowire(param: '...')]`

To inject a scalar container parameter, use `#[Autowire(param: '...')]`:

```php
public function __construct(
    #[Autowire(param: 'ari_plans')]
    private readonly array $plans,
) {}
```

### What to avoid

- **Do not inject `ContainerInterface`** directly. It hides dependencies, makes classes hard to test, and violates Deptrac rules (see Section 4).
- **Do not use the service locator pattern** unless you are implementing a plugin registry that is genuinely dynamic. Even then, prefer tagged service iterators.

---

## 4. Deptrac Layer Rules

Deptrac enforces architectural boundaries. Violating these rules will fail the CI `make deptrac` check.

See [Deptrac Layers](./deptrac-layers.md) for the complete reference. The rules most relevant to service development:

| Dependency direction | Allowed? |
|---|---|
| `Service` → `Repository` | Yes |
| `Service` → `Entity` | Yes |
| `Service` → other `Service` | Yes |
| `Service` → `State/` (Providers/Processors) | **No** — circular dependency |
| `State/` → `Service` | Yes — the correct direction |
| `Repository` → `Entity` | Yes |
| `Repository` → `Service` | **No** |
| `Service` → `Doctrine\DBAL\Connection` (raw) | **No** — see below |

### Raw DBAL Connection restriction

Services must not access `Doctrine\DBAL\Connection` directly. Use DQL or the QueryBuilder API instead:

```php
// Correct: DQL via EntityManager
$results = $this->em->createQuery(
    'SELECT c FROM ' . Contact::class . ' c WHERE c.user = :user'
)->setParameter('user', $user)->getResult();

// Correct: QueryBuilder
$results = $this->em->createQueryBuilder()
    ->select('c')
    ->from(Contact::class, 'c')
    ->where('c.user = :user')
    ->setParameter('user', $user)
    ->getQuery()
    ->getResult();

// Forbidden: bypasses TenantFilter silently
$conn = $this->em->getConnection();
$conn->fetchAllAssociative('SELECT * FROM contact WHERE user_id = ?', [$userId]);
```

**Exception:** Metrics or admin-only services that must deliberately bypass the `TenantFilter` (e.g. to count rows across all tenants for a dashboard) may use raw DBAL. This exception **must be explicitly documented** in the class docblock:

```php
/**
 * Admin metrics service. Deliberately uses raw DBAL to bypass TenantFilter
 * and query across all tenants. Never expose to non-admin callers.
 */
final class MetricsAggregationService { ... }
```

---

## 5. Stateless vs Stateful Services

Keep services **stateless** by default. A stateless service holds no mutable instance data between calls. This makes services safe to share across requests in Symfony's long-lived Messenger worker processes.

### In-request caching (acceptable)

Caching computed values for the duration of a single request is acceptable and does not make a service stateful in a problematic sense. `EntitlementService` caches the resolved plan ID per user object using `spl_object_id()` as a key:

```php
private array $planIdCache = [];

private function resolvePlanId(User $user): string
{
    $cacheKey = spl_object_id($user);
    if (isset($this->planIdCache[$cacheKey])) {
        return $this->planIdCache[$cacheKey];
    }
    // ... resolve and cache
    return $this->planIdCache[$cacheKey] = $planId;
}
```

This is safe because Symfony creates a fresh container (and fresh service instances) for each HTTP request.

### Messenger workers: implement `ResetInterface`

In Symfony Messenger worker processes, the same service instances are reused across many message dispatches. If your service accumulates state between calls (e.g. an event listener that batches updates), implement `Symfony\Contracts\Service\ResetInterface`:

```php
use Symfony\Contracts\Service\ResetInterface;

final class BatchingEventListener implements ResetInterface
{
    private array $pendingUpdates = [];

    public function reset(): void
    {
        $this->pendingUpdates = [];
    }
}
```

Symfony's Messenger component calls `reset()` on all `ResetInterface` services between messages, preventing state leakage.

---

## 6. Testing

### Unit tests

Place unit tests in `tests/Unit/Service/`. Unit tests should not touch the database.

- **Mock interfaces, not concrete classes.** If a service depends on `EntitlementServiceInterface`, create a `MockEntitlementService` or use PHPUnit's `createMock(EntitlementServiceInterface::class)`.
- Avoid mocking concrete classes — this tightly couples the test to the implementation.

```php
// Good: mock the interface
$entitlement = $this->createMock(EntitlementServiceInterface::class);
$entitlement->method('checkQuota')->willReturn(EntitlementState::Allowed);

// Avoid: mock the concrete class
$entitlement = $this->createMock(EntitlementService::class);
```

### Functional tests

Place functional tests (tests that require a real database) in `tests/Functional/`. These tests use the `test` environment, which uses an in-memory SQLite database and disables rate limiters.

A typical functional test for a service that a StateProcessor calls:

1. Create fixture data in the test database via the test helpers.
2. Make an HTTP request through the API Platform kernel.
3. Assert the response body and HTTP status code.
4. Optionally query the database directly to verify side effects (e.g. a new entity was persisted).

See `tests/Functional/ContactApiTest.php` for a complete example.
