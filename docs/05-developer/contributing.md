---
id: contributing
title: Contributing Guide
sidebar_label: Contributing
---

# Contributing Guide

This guide covers the end-to-end workflow for contributing to the Ari backend. Frontend-specific guidelines live in `ari/web-client/docs/`.

---

## PR Workflow

1. **Branch** — create a feature branch from `main`. Use a short, descriptive name:
   ```
   feat/playbook-seasonal-checkin
   fix/firewall-login-prefix
   refactor/tenant-filter-configurator
   ```

2. **Develop** — make changes, write tests, run the full QA suite locally before pushing:
   ```bash
   # From ari/core/ — runs PHPStan + Psalm + Deptrac + PHPUnit
   make qa
   ```

3. **Open a PR** — title should follow commit message conventions (see below). Add a brief description of what changed and why.

4. **`make qa` must pass** — CI runs the same suite. PRs with failing checks are not reviewed. Fix failures before requesting review.

5. **Code review** — at least one approval required. Reviewers use the checklist below.

6. **Merge** — squash merge to `main`. The squash commit message must follow conventions.

---

## Commit Message Conventions

Use the **Conventional Commits** format:

```
<type>(<optional scope>): <short summary>

[optional body]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New user-visible feature or new API endpoint |
| `fix` | Bug fix — something that was broken and now works correctly |
| `refactor` | Code change that neither adds a feature nor fixes a bug |
| `test` | Adding or updating tests only |
| `docs` | Documentation changes only (code unchanged) |
| `chore` | Dependency bumps, tooling config, CI pipeline changes |
| `perf` | Performance improvement with no behavior change |
| `security` | Security fix — rate limiting, input validation, auth hardening |

### Examples

```
feat(contacts): add cadence reminder endpoint

fix(firewall): rename /api/login_history to /api/auth_history to avoid json_login trap

refactor(tenant): extract TenantFilterConfigurator to dedicated subscriber

test(sms-import): add 401 and tenant isolation tests for /api/sms_backup/import

docs(architecture): document API key scope enforcement pattern

chore: bump symfony/security-bundle to 7.4.3
```

### Rules

- Summary line: imperative mood, no period, ≤ 72 characters.
- Scope is optional but encouraged for non-trivial changes.
- Breaking changes: add `!` after the type (`feat!:`) and describe the migration path in the body.

---

## Code Review Checklist

Reviewers verify all of the following before approving.

### Quality Gate

- [ ] `make qa` passes — PHPStan level 8, Psalm level 3, Deptrac layers, PHPUnit all green.
- [ ] No new PHPStan/Psalm suppressions added without a comment explaining why.
- [ ] `make cs-fix` was run and committed (no style violations).

### Tests

New API endpoints (ApiResource operations, custom controllers, State Providers) require:

- [ ] **Happy path** — authenticated request returns the expected response shape and HTTP status.
- [ ] **401 without token** — unauthenticated request is rejected.
- [ ] **Tenant isolation** — User B cannot read or mutate User A's data (wrong-tenant entity returns 404 or 403, never 200 with another user's data).
- [ ] **Pagination** — if the endpoint is a collection, assert `hydra:totalItems`, `hydra:view`, and that `itemsPerPage` is respected.
- [ ] **Validation errors** — if the endpoint accepts a request body, assert that invalid input returns 422 with meaningful violation messages.

Reference implementation: `tests/Functional/AuthHistoryApiTest.php`.

### i18n

- [ ] Every new user-visible string has a translation key in **both** `en.json` and `ru.json`.
- [ ] No hardcoded English strings in React components or API error messages rendered in the UI.
- [ ] New translation keys follow the existing namespace convention (`settings.phoneBackup.title`, `contacts.form.cadence`, etc.).

### API Contract

- [ ] If the OpenAPI spec changed (new endpoint, new field, changed response shape), the API docs have been updated.
- [ ] TypeScript types regenerated after backend changes: `cd ari/web-client && npm run gen:types`.
- [ ] No removal or renaming of existing response fields without a deprecation + migration path.

### Security

- [ ] New `Get`, `Patch`, `Put`, `Delete` operations on single entities use `security: "is_granted('<PERMISSION>', object)"` — not `ROLE_USER`.
- [ ] New `GetCollection` operations rely on `TenantFilter` (no object is available; `ROLE_USER` is correct here).
- [ ] `findOneBy` / `find` calls on tenant-owned entities include `'tenant' => $user` to prevent cross-tenant reads.
- [ ] No user-supplied strings interpolated into DQL or SQL.

### Architecture

- [ ] New classes placed in the correct layer (`src/Entity/`, `src/Service/`, `src/Repository/`, etc.).
- [ ] Deptrac layer rules respected — controllers and commands do not access repositories directly; they go through services.
- [ ] No circular dependencies introduced.

### Breaking Changes

- [ ] No breaking changes without a documented migration path (migration script, documentation update, version bump).
- [ ] Database migrations reviewed — irreversible changes flagged explicitly.

---

## When to Update Which Document

### `ari-pm/CLAUDE.md`

Update this file when:
- A new architectural pattern or invariant is established (e.g., a new "never do X" rule learned from a bug).
- A new major feature is implemented and future AI-assisted development needs to know about it.
- A new integration is added (new external service, new env var group).
- A gotcha is discovered that could cause subtle bugs (e.g., the firewall prefix trap, the `skipAlphanumeric` string check).

This file is the primary context source for AI-assisted development. Keep it accurate and concise — avoid prose that duplicates what the code already makes obvious.

### `ari-docs/`

Update this site when:
- A user-facing feature changes (new UI flow, changed API endpoint that consumers call).
- A new self-hosting configuration option is added.
- A developer guide needs updating because the workflow changed (e.g., new `make` target, new required step).
- API contract changes that downstream integrators (API key users, plugin authors) must know about.

The `ari-docs/` site is the public-facing documentation for end users and integrators.

### `ari/core/ARCHITECTURE.md`

Update this file when:
- A new architectural layer or pattern is established in the backend.
- A new critical invariant is added (e.g., a new "never disable X in a request context" rule).
- A significant new subsystem is added (new entity group, new auth mechanism, new async flow).
- The Deptrac rules change.

This file is the authoritative reference for the backend architecture. It should be accurate enough that a new backend developer can understand the system's structure without reading all the code.

---

## Definition of Done

A feature is done when **all** of the following are true:

1. **PHPStan** — `make phpstan` exits 0 (level 8, no ignored errors added without justification).
2. **Psalm** — `make psalm` exits 0 (level 3).
3. **Deptrac** — `make deptrac` exits 0 (no layer violations).
4. **PHPUnit** — `make test` exits 0; new endpoints covered by functional tests (happy path, 401, tenant isolation, pagination where applicable).
5. **E2E tests** — `make test` in `ari-e2e/` passes for all flows affected by the change. New user-visible flows have at least one Playwright test tagged `@smoke`.
6. **i18n** — All new strings present in both `en.json` and `ru.json`.
7. **Docs updated** — `ari/core/ARCHITECTURE.md`, `ari-pm/CLAUDE.md`, and/or `ari-docs/` updated as appropriate (see section above).
8. **PR approved** — at least one code review approval with the checklist satisfied.
