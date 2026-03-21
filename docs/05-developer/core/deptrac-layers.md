---
title: Deptrac Architectural Layers
sidebar_label: Deptrac Layers
---

# Deptrac Architectural Layers

Deptrac enforces that code in one architectural layer does not illegally depend on code in another layer. Run it with:

```bash
make deptrac          # Check for violations (run in CI)
make deptrac-strict   # Also flag uncovered files (run periodically)
```

---

## Layer map

| Layer | Namespace prefix | Contents |
|---|---|---|
| `Entity` | `Ari\Entity\` | Doctrine entities, value objects |
| `Dto` | `Ari\Dto\` | Data Transfer Objects |
| `Exception` | `Ari\Exception\` | Domain exceptions |
| `Security` | `Ari\Security\` | Voters, traits, interfaces |
| `Repository` | `Ari\Repository\` | Doctrine repositories |
| `Service` | `Ari\Service\` | Business logic services |
| `EventListener` | `Ari\EventListener\` | Doctrine / Symfony event listeners |
| `EventSubscriber` | `Ari\EventSubscriber\` | Symfony event subscribers |
| `State` | `Ari\State\` | API Platform State Providers & Processors |
| `Controller` | `Ari\Controller\` | Custom Symfony controllers |
| `Command` | `Ari\Command\` | Console commands |
| `ApiResource` | `Ari\ApiResource\` | Non-entity API Platform resources |
| `Filter` | `Ari\Filter\` | Custom API Platform filters |
| `Form` | `Ari\Form\` | Symfony form types |
| `MessageHandler` | `Ari\MessageHandler\` | Messenger message handlers |
| `Message` | `Ari\Message\` | Messenger message DTOs |
| `Doctrine` | `Ari\Doctrine\` | Doctrine extensions (filters, types) |
| `Kernel` | `Ari\` root | `Kernel.php` |
| `Plugins` | `Plugins\` | All plugin code |

---

## Allowed dependency directions

```
Controller, Command, ApiResource, Form
    ↓
Service, MessageHandler
    ↓
Repository
    ↓
Entity, Dto, Exception, Security (traits/interfaces)

State (Providers/Processors)
    ↓ can depend on
Service, Repository, Entity, Dto, Exception, Security

EventListener, EventSubscriber
    ↓ can depend on
Service, Repository, Entity, Dto

Plugins → Service, Repository, Entity (ORM path only)
Plugins → Doctrine\DBAL\Connection: FORBIDDEN (see below)
```

**Key rules:**
- `Repository` → only `Entity` (no Service, no State)
- `State` → `Service`, `Repository`, `Entity`, `Dto`, `Exception` (not `Controller`)
- `Service` → `Repository`, `Entity`, `Dto`, `Message`, `Exception` (not `State`, not `Controller`)
- `Controller` → `Service` only (never `Repository` directly)

---

## Common violations and fixes

### "State tried to access Repository directly"

```
State\ContactProcessor → Repository\ContactRepository  ✗
```

**Fix**: Either inject the repository into the processor (add an `allow` rule to `deptrac.yaml` if State→Repository is already permitted — check the yaml), or wrap the query in a Service method.

In this project, `State` is explicitly allowed to depend on `Repository` for simple query delegation. Check `deptrac.yaml` `ruleset` section.

### "Service tried to access State"

```
Service\SomeService → State\SomeProcessor  ✗
```

**Fix**: Extract the shared logic into a new Service or move it to a MessageHandler.

### "Controller tried to access Repository directly"

```
Controller\MyController → Repository\ContactRepository  ✗
```

**Fix**: Add a Service method that wraps the repository call, and inject the Service into the controller.

---

## Plugin isolation rule

Plugins (`Plugins\*`) **cannot import `Doctrine\DBAL\Connection` directly**. All DB access from plugin code must go through the ORM (DQL / QueryBuilder / Repository). This ensures the Doctrine `TenantFilter` always applies and cross-tenant data leaks are impossible.

If a plugin genuinely needs raw SQL (e.g. for performance), it must:
1. Be explicitly excluded in `deptrac.yaml` with a comment explaining why.
2. Add `AND tenant_id = ?` manually to every raw query.
3. Be reviewed and approved by the tech lead.

See `ari-pm/docs/PluginSecurityContract.md` for the full plugin security contract.

---

## Updating deptrac.yaml

Changes to `deptrac.yaml` are architectural decisions and require tech lead sign-off. When adding a new namespace:

1. Add it to the `layers` section.
2. Add allowed dependencies to the `ruleset` section.
3. Run `make deptrac-strict` to verify no uncovered files remain.
4. Document the rationale in the PR description.
