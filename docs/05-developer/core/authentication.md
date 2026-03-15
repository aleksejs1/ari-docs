---
title: Authentication & Active Sessions
sidebar_label: Authentication
---

# Authentication & Active Sessions

## Overview
ari uses **JWT (JSON Web Token)** for authentication.
- **Short-lived Access Tokens**: Valid for 5 minutes.
- **Long-lived Refresh Tokens**: Valid for 30 days.

This mechanism enhances security by minimizing the window of opportunity if an access token is compromised. It also allows users to immediately revoke access for specific devices (long-lived sessions) via the Active Sessions API.

## User Guide
### Login
When you log in, you receive:
1.  `token`: Access token (JWT).
2.  `refresh_token`: Token to obtain new access tokens.

### Active Sessions
You can view your active sessions in "Security" settings.
- **View**: See a list of devices/sessions currently logged in.
- **Revoke**: Log out a specific device by deleting its session. This invalidates the Refresh Token. The device will be logged out once its current 5-minute Access Token expires.

## Developer Guide
### Technology Stack
- **LexikJWTAuthenticationBundle**: Handles JWT generation and validation.
- **GesdinetJWTRefreshTokenBundle**: Handles Refresh Token lifecycle.

### Multi-Tenancy
Refresh Tokens are strictly scoped to the `Tenant` (User).
- **Storage**: Custom `Ari\Entity\RefreshToken` entity.
- **Isolation**: Implements `Ari\Security\TenantAwareInterface`. The `TenantFilter` automatically ensures users can only see and manage their own tokens.
- **Audit**: Tokens include `ipAddress` and `userAgent` captured at login (via `Ari\EventListener\RefreshTokenListener`).

### API Endpoints
- `POST /api/token/refresh`: Exchange a refresh token for a new JWT.
- `GET /api/active-sessions`: List active refresh tokens.
- `DELETE /api/active-sessions/{id}`: Revoke a refresh token.
- `POST /api/logout`: Revokes the current refresh token.

---

## API Key Authentication

API keys allow AI agents, scripts, and automation tools to access the same `/api/*` endpoints as the web browser, but with **per-key permission scopes** and **rate limiting**.

### Token format

```
Authorization: Bearer ari_<64-hex-chars>
```

The raw secret is generated as `ari_` + `bin2hex(random_bytes(32))` (256 bits of entropy). Only a SHA-256 hex digest is stored in the database. The last four characters of the raw secret (`secretLastFour`) are stored in plaintext for UI display.

### Why SHA-256 and not Argon2id

API secrets are long, cryptographically random strings — not user-chosen passwords. Argon2id's deliberate slowness is designed to resist dictionary attacks on weak passwords. Applied to random secrets it adds no security but wastes 100–300 ms of CPU on every API request. SHA-256 + `hash_equals()` takes microseconds and is safe because 32 random bytes have 2²⁵⁶ possible values.

### Firewall order

`ApiKeyAuthenticator` is registered **before** `jwt` on the `api` firewall:

```yaml
# config/packages/security.yaml
firewalls:
    api:
        pattern: ^/api
        stateless: true
        custom_authenticators:
            - Ari\Security\ApiKeyAuthenticator
        jwt: ~
```

If `ApiKeyAuthenticator::supports()` returns false (header doesn't start with `Bearer ari_`), Symfony falls through to the JWT authenticator — existing behaviour is fully preserved.

> **Implementation note**: Symfony's JWT bundle intercepts any `Bearer` token before custom authenticators run. `ApiKeyJwtBypassSubscriber` (priority 500) moves `ari_*` tokens from `Authorization` to a private header before the security firewall fires, ensuring the JWT authenticator never sees them.

### ApiKeyToken and role propagation

On successful authentication, `createToken()` returns an `ApiKeyToken extends AbstractToken` carrying:
- The authenticated `User` object
- The user's own roles (including `ROLE_USER`) — so `IS_AUTHENTICATED_FULLY` and `access_control` rules pass
- The key's UUID, name, last-four suffix, and scopes array

JWT sessions are unaffected — they continue to use `PostAuthenticationToken` with no scope restrictions.

### Scope enforcement in voters

Voters check the token type at the top of `voteOnAttribute`:

```php
if ($token instanceof ApiKeyToken) {
    $required = match ($attribute) {
        self::VIEW   => 'contacts:read',
        self::EDIT   => 'contacts:write',
        self::ADD    => 'contacts:write',
        self::DELETE => 'contacts:delete',
        default      => null,
    };
    if ($required !== null && !$token->hasScope($required)) {
        return false;
    }
}
// ... existing tenant ownership check unchanged
```

`hasScope()` resolves wildcards: `*` grants everything; `contacts:*` grants all `contacts:` scopes.

### Rate limiting

Every API key response includes standard rate-limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 743
X-RateLimit-Reset: 1718123456
```

Headers are present on **all** responses — including 401 and 403 — so agents know how many attempts remain before backing off. When the limit is reached: `429 Too Many Requests` + `Retry-After`.

Configure the limit via the `API_KEY_RATE_LIMIT` env var (default: 1 000 req/hour). In test environments set it to a small value (e.g. `5`) to trigger 429s without 1 000 requests.

### Trusted proxies and `lastUsedIp`

`$request->getClientIp()` returns the real client IP only when `trusted_proxies` is configured:

```yaml
# config/packages/framework.yaml
framework:
    trusted_proxies: '%env(TRUSTED_PROXIES)%'
    trusted_headers:
        - x-forwarded-for
        - x-forwarded-host
        - x-forwarded-port
        - x-forwarded-proto
```

Set `TRUSTED_PROXIES` to your reverse proxy CIDR (e.g. `127.0.0.1,10.0.0.0/8`). Without this, `lastUsedIp` will record the proxy address.

### Entitlement gate

Access to API key management is controlled by two entitlements:
- **Feature flag** `api_keys` — gates the "Integrations" settings tab and `POST /api/api_keys`
- **Quota** `api_keys` — maximum number of active keys per user (plan-dependent; 0 = unlimited)

See [`api-keys.md`](./api-keys.md) for the full developer reference.

---

### Security Considerations

#### Public Logout Endpoint
The `/api/logout` endpoint is deliberately configured with `PUBLIC_ACCESS`.

1.  **Credential Possession**: The "authentication" for this endpoint is the possession of the Refresh Token itself (passed via boolean/cookie). This 128-char random string is a high-security credential. Brute-forcing it is computationally infeasible.
2.  **Expired Access Tokens**: Use case: A user returns to the app after 10 minutes. Their Access Token (TTL 5m) is expired. They want to "Log Out". If the endpoint required a valid Access Token, the request would be rejected (401), effectively preventing them from invalidating the Refresh Token without first refreshing it (poor UX).
3.  **Consistency**: This matches the security model of `/api/token/refresh`, which is also public for the exact same reason (you can't use an expired access token to get a new token; you use the credentials: the refresh token).
