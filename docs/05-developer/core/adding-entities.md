---
title: Adding Entities
sidebar_label: Adding Entities
---

# Adding Entities

This guide walks through creating a new Doctrine entity that integrates with the multi-tenant architecture, API Platform, and the audit log.

---

## When to add a new entity

Add a new entity when you need to persist a distinct domain concept with its own lifecycle (create / read / update / delete) that belongs to a user, or is truly global (e.g. `PlaybookTemplate`).

If the data is small and unstructured, consider a `json` Doctrine column on the parent entity first.

---

## Minimal entity skeleton

```php
<?php
declare(strict_types=1);

namespace Ari\Entity;

use Ari\Security\TenantAwareInterface;
use Ari\Security\TenantAwareTrait;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;

#[ORM\Entity(repositoryClass: MyThingRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('MY_THING_VIEW', object)"),
    ],
    normalizationContext: ['groups' => ['my_thing:read']],
)]
class MyThing implements TenantAwareInterface
{
    use TenantAwareTrait; // adds $tenant (FK + onDelete:CASCADE)

    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    public function getId(): ?int { return $this->id; }
}
```

---

## Tenant isolation — mandatory for user-owned data

Every entity that belongs to a user **must** implement `TenantAwareInterface` and use `TenantAwareTrait`. The trait adds a `tenant_id` foreign key with `onDelete: CASCADE` — deleting a user removes all their data automatically.

`TenantFilter` (Doctrine SQLFilter active on every HTTP request) automatically appends `AND tenant_id = <current_user_id>`. This means:

- `GetCollection` endpoints are isolated automatically — `security: "is_granted('ROLE_USER')"` is sufficient.
- `Get`/`Patch`/`Put`/`Delete` endpoints **must** use a Voter: `security: "is_granted('MY_THING_VIEW', object)"`.
- Direct `$em->find(MyThing::class, $id)` **bypasses TenantFilter** — always use `findOneBy(['id' => $id, 'tenant' => $user])`.

---

## Primary key choices

| Pattern | When to use |
|---|---|
| Auto-increment int (default) | Most entities |
| UUID v7 (`Uuid::v7()`) | ID needed before persistence, or time-ordered UUIDs desired |

---

## Repository

Create `src/Repository/MyThingRepository.php` extending `ServiceEntityRepository<MyThing>`. Never put business logic in repositories — keep queries focused on data retrieval.

Any method that interpolates a field name into DQL must validate it first:

```php
if (1 !== preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $field)) {
    throw new \InvalidArgumentException("Invalid field: '$field'");
}
```

---

## Migration

```bash
# Generate
docker exec ari-app-1 bash -c "cd /app/core && php bin/console doctrine:migrations:diff"
# Apply
docker exec ari-app-1 bash -c "cd /app/core && php bin/console doctrine:migrations:migrate"
```

Review the generated file: verify no unintended renames/drops, and that `down()` correctly reverses `up()`.

---

## Voter (for owned resources)

Create `src/Security/Voter/MyThingVoter.php`. In `voteOnAttribute`, check `$subject->getTenant() === $user`. If the request is from an `ApiKeyToken`, additionally verify the required scope is present.

---

## Audit logging

Any entity implementing `TenantAwareInterface` is **automatically audited** by `AuditLogSubscriber` — no extra code needed.

---

## Checklist

- [ ] Entity in `src/Entity/` implements `TenantAwareInterface` + `TenantAwareTrait` (if user-owned)
- [ ] Repository in `src/Repository/`
- [ ] Migration generated, reviewed, applied; `down()` verified
- [ ] Serialization `#[Groups]` defined
- [ ] Voter created for detail/mutate operations; `security` attribute on all operations
- [ ] Functional tests: happy path, 401, tenant isolation
- [ ] `make qa` passes
