# Fix Refresh Token Flow for Connection Hub

## Problem Statement

The connection hub OAuth flow is missing proper refresh token support. When an MCP client's access token expires, it cannot refresh and must re-authenticate.

### Current Issues

1. **No refresh token returned in token exchange response**

   - `access-token.ts` returns only `access_token` for connection hub codes (lines 68-76)
   - OAuth clients expect a `refresh_token` in the response to use later

2. **JWT structure mismatch between creation and consumption**

   - `connection-done.ts` creates JWTs with **nested structure**: `{ atlassian: { refresh_token: "..." } }`
   - `refresh-token.ts` expects **flat structure**: `{ atlassian_refresh_token: "..." }`
   - This means even if we returned a refresh token, the refresh flow would fail

3. **Connection hub only creates access token JWT**

   - `connection-done.ts` creates a single JWT with embedded provider tokens
   - It doesn't create a separate refresh token JWT with `type: 'refresh_token'`

4. **No Figma refresh implementation**
   - `refresh-token.ts` only handles Atlassian refresh
   - Figma uses a different endpoint and auth pattern than Atlassian

### Current Token Flow

```
1. User connects providers via connection hub
2. connection-done.ts creates JWT with nested structure:
   {
     sub: "user-xxx",
     atlassian: { access_token, refresh_token, expires_at },
     figma: { access_token, refresh_token, expires_at },
     exp: <shortest_provider_expiration>
   }
3. JWT stored in authorization code store
4. MCP client exchanges code at /access-token
5. access-token.ts returns: { access_token: <JWT>, token_type, expires_in, scope }
   ❌ NO refresh_token returned!
6. When access token expires, client has no way to refresh
```

### Expected Token Flow (per RFC 6749)

```
1-4. Same as above
5. access-token.ts returns:
   {
     access_token: <JWT>,
     refresh_token: <refresh_JWT>,  ← MISSING
     token_type,
     expires_in,
     scope
   }
6. When access token expires, client calls /access-token with:
   { grant_type: "refresh_token", refresh_token: <refresh_JWT> }
7. refresh-token.ts extracts provider refresh tokens from JWT
8. Exchanges with providers for new access tokens
9. Returns new access_token + refresh_token
```

## Design Decisions

Based on requirements discussion:

1. **Token Expiration Strategy**: Set JWT access token to expire when the **first** of Figma or Atlassian's access token expires. Always refresh both providers together.

2. **Refresh Failure Handling**: If one provider's refresh succeeds but another fails, **fail the entire refresh** (user must re-authenticate). This keeps the token state simple and consistent.

3. **Token Helper Refactoring**: Refactor existing Atlassian-specific functions (`createJiraMCPAuthToken`) to be **provider-agnostic**. Don't add new functions alongside - replace the existing ones.

4. **Refresh Token Structure**: Single refresh token JWT containing **all provider refresh tokens** (same pattern as access tokens).

## Provider Refresh API Differences

### Atlassian Refresh

- **Endpoint**: `POST https://auth.atlassian.com/oauth/token`
- **Auth Method**: `client_id` + `client_secret` in request body (JSON)
- **Request Body**: `{ grant_type: "refresh_token", client_id, client_secret, refresh_token }`
- **Response**: Returns **new `refresh_token`** with each refresh (rotating refresh tokens)

### Figma Refresh

- **Endpoint**: `POST https://api.figma.com/v1/oauth/refresh` (different endpoint, not `/token`!)
- **Auth Method**: HTTP Basic Auth header: `Authorization: Basic <base64(client_id:client_secret)>`
- **Request Body**: `refresh_token=<token>` (form-urlencoded)
- **Response**: Returns only `access_token`, `token_type`, `expires_in` - **NO new refresh_token**
- **⚠️ Critical**: The same refresh token remains valid indefinitely and **must be reused** on subsequent refreshes. Our code must preserve the original Figma refresh token when creating new JWT refresh tokens.
