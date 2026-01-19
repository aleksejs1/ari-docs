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
- **Storage**: Custom `App\Entity\RefreshToken` entity.
- **Isolation**: Implements `App\Security\TenantAwareInterface`. The `TenantFilter` automatically ensures users can only see and manage their own tokens.
- **Audit**: Tokens include `ipAddress` and `userAgent` captured at login (via `App\EventListener\RefreshTokenListener`).

### API Endpoints
- `POST /api/token/refresh`: Exchange a refresh token for a new JWT.
- `GET /api/active-sessions`: List active refresh tokens.
- `DELETE /api/active-sessions/{id}`: Revoke a refresh token.
- `POST /api/logout`: Revokes the current refresh token.

### Security Considerations

#### Public Logout Endpoint
The `/api/logout` endpoint is deliberately configured with `PUBLIC_ACCESS`.

1.  **Credential Possession**: The "authentication" for this endpoint is the possession of the Refresh Token itself (passed via boolean/cookie). This 128-char random string is a high-security credential. Brute-forcing it is computationally infeasible.
2.  **Expired Access Tokens**: Use case: A user returns to the app after 10 minutes. Their Access Token (TTL 5m) is expired. They want to "Log Out". If the endpoint required a valid Access Token, the request would be rejected (401), effectively preventing them from invalidating the Refresh Token without first refreshing it (poor UX).
3.  **Consistency**: This matches the security model of `/api/token/refresh`, which is also public for the exact same reason (you can't use an expired access token to get a new token; you use the credentials: the refresh token).
