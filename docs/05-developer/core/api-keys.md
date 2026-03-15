---
title: API Keys
sidebar_label: API Keys
---

# API Keys — Developer Reference

API keys let AI agents, scripts, and automation tools access the Ari REST API with **scoped, revocable** tokens. The same `/api/*` endpoints used by the web browser are reused — no separate "AI API" is needed.

## Entity: `ApiKey`

```php
class ApiKey implements TenantAwareInterface
{
    string   $id;             // UUID v4
    User     $tenant;         // owner (onDelete: CASCADE)
    string   $name;           // human label, e.g. "Claude Desktop"
    string[] $scopes;         // e.g. ["contacts:read", "groups:*"]
    string   $secretHash;     // SHA-256 hex digest of the raw secret
    string   $secretLastFour; // last 4 chars of raw secret — display only
    ?string  $lastUsedAt;     // updated asynchronously on each request
    ?string  $lastUsedIp;     // real client IP (requires trusted_proxies)
    ?string  $appType;        // predefined type: claude | zapier | n8n | make | custom
    DateTime $createdAt;
}
```

`secretHash` is masked in audit log snapshots. The `token` field is transient — it appears in the POST response only and is never stored.

## Token format

```
Authorization: Bearer ari_<64-hex-chars>
```

**Generation** (in `ApiKeyProcessor`):
```php
$rawToken = 'ari_' . bin2hex(random_bytes(32));   // 256 bits of entropy
$hash     = hash('sha256', $rawToken);             // stored in secretHash
$lastFour = substr($rawToken, -4);                 // stored in secretLastFour
```

**Verification** (in `ApiKeyAuthenticator`):
```php
$hash   = hash('sha256', $rawToken);
$apiKey = $repository->findBySecretHash($hash);    // indexed lookup
// No hash_equals needed — SHA-256 output is not timing-sensitive for random inputs
```

## Scope model

Scopes follow `resource:action`. Actions: `read`, `write`, `delete`.

| Scope | Grants |
|---|---|
| `contacts:read` | GET contacts, names, phones, emails, dates, addresses, organizations, biographies, relations |
| `contacts:write` | POST/PATCH on the above |
| `contacts:delete` | DELETE contacts and their sub-resources |
| `groups:read` | GET groups and group membership |
| `groups:write` | POST/PATCH groups |
| `groups:delete` | DELETE groups |
| `audit_logs:read` | GET audit log entries and timeline |
| `ai_suggestions:read` | GET AI suggestions |
| `ai_suggestions:write` | POST/PATCH AI suggestions (accept, dismiss, batch trigger) |

Rules:
- `write` does **not** imply `read`.
- `delete` does **not** imply `write`.
- JWT sessions (browser) bypass scope checks entirely.

### Wildcard resolution

`ApiKeyToken::hasScope(string $required): bool`:

```php
foreach ($this->scopes as $granted) {
    if ('*' === $granted)              return true;  // full access
    if ($granted === $required)        return true;  // exact match
    if (str_ends_with($granted, ':*')) {
        $resource = substr($granted, 0, -2);
        if (str_starts_with($required, $resource . ':')) return true;
    }
}
return false;
```

| Scope stored | Grants |
|---|---|
| `*` | everything |
| `contacts:*` | `contacts:read`, `contacts:write`, `contacts:delete` |
| `groups:*` | `groups:read`, `groups:write`, `groups:delete` |

## `appType` catalog

`appType` is an optional free-form string from a predefined set. It powers usage analytics without relying on free-text names.

| `appType` | Display name |
|---|---|
| `claude` | Claude (Anthropic) |
| `zapier` | Zapier |
| `n8n` | n8n |
| `make` | Make |
| `custom` | Custom script |

## Key lifecycle

```
POST /api/api_keys          → creates key, returns token ONCE
GET  /api/api_keys          → list keys (metadata only, paginated)
GET  /api/api_keys/{id}     → single key
PATCH /api/api_keys/{id}    → rename or update scopes (token unchanged)
DELETE /api/api_keys/{id}   → hard delete (immediate revocation)
```

**Hard delete rationale**: `AuditLog.actorLabel` is a plain-text snapshot — no FK dependency on `ApiKey`. The audit trail survives deletion. Soft delete adds complexity (filtering, TTL cleanup) with no benefit.

**Secret rotation**: There is no secret rotation endpoint. To rotate: revoke (`DELETE`) and re-create (`POST`). This is the same pattern used by GitHub PATs.

## Rate limiting

Implemented via `symfony/rate-limiter` (sliding window, per key UUID):

| Parameter | Default | Override |
|---|---|---|
| Limit | 1 000 req/hour | `API_KEY_RATE_LIMIT` env var |
| Window | 1 hour | — |

Response headers on **every** API key response (including 4xx):

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 743
X-RateLimit-Reset: 1718123456   # Unix timestamp
```

When limit exceeded: `429 Too Many Requests` + `Retry-After` header.

**Test environments**: Set `API_KEY_RATE_LIMIT=5` to trigger 429 after 5 requests without running 1 000.

## `lastUsedAt` / `lastUsedIp` updates

Updated via a `KernelEvents::TERMINATE` subscriber — fires after the response is sent (non-blocking for the client):

```php
$this->em->getConnection()->executeStatement(
    'UPDATE api_key SET last_used_at = ?, last_used_ip = ? WHERE id = ?',
    [now, clientIp, apiKeyId],
);
```

Raw SQL avoids EntityManager state issues and lost-update contention on concurrent requests. A lost update on `lastUsedAt` is acceptable — last-writer-wins is fine for a display-only field.

## Audit logging

`AuditLogSubscriber` sets `AuditLog.actorLabel` for API key sessions:

```
api_key:550e8400-e29b-41d4-a716-446655440000 (Claude Desktop, ...ab3f)
```

Format: `api_key:{uuid} ({name}, ...{lastFour})`.

The UUID avoids ambiguity when a key is deleted and a new one with the same name is created. The name and suffix make the entry human-readable without any FK dependency on the (potentially deleted) key row.

## Entitlements

| Entitlement | Type | Effect |
|---|---|---|
| `api_keys` feature flag | Feature | Gates "Integrations" tab visibility and `POST /api/api_keys` |
| `api_keys` quota | Quota | Maximum active keys per user (0 = unlimited) |

Configure per plan in `config/packages/plans.yaml`:

```yaml
self_hosted:
  api_keys_limit: 0       # unlimited
  features:
    api_keys: true
free:
  api_keys_limit: 5
  features:
    api_keys: true
```

Override limit via env var: `APP_API_KEYS_LIMIT_{PLAN_ID_UPPER}` (e.g. `APP_API_KEYS_LIMIT_FREE=10`).

## Security considerations

| Concern | Mitigation |
|---|---|
| Secret hashing performance | SHA-256 + `hash_equals` — microseconds, not 100–300 ms |
| Secret exposure | Shown once at creation; only SHA-256 hash stored |
| Leaked key identification | `secretLastFour` + `name` visible in UI (`ari_...ab3f`) |
| Unexpected usage | `lastUsedIp` visible in UI — unexpected IP signals compromise |
| IP spoofing | Symfony `trusted_proxies` config; only headers from trusted IPs honoured |
| Scope creep | Voters enforce scopes on every request, not just at key creation |
| Role escalation | `ApiKeyToken` carries user's own roles only — no elevation |
| Tenant isolation | `ApiKey` is tenant-aware; `TenantFilter` applies automatically |

## Post-MVP roadmap

- **Redis/APCu cache**: Cache `ApiKey` by UUID for high-traffic deployments; invalidate on PATCH/DELETE.
- **Expiry notifications**: Email 3 days and 1 day before `expiresAt` to prevent silent 401 failures in automations.
- **Usage analytics**: Aggregate `appType` distribution for product insights.
