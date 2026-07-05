# Patina Web Activity Protocol

## Purpose

This document defines the local protocol between Patina and Patina Web Sync.

Patina owns the receiving endpoint and local data behavior. Patina Web Sync owns the browser extension clients that send active-tab metadata to the local Patina app.

## Boundary

- The protocol is local-only.
- Clients connect to `http://127.0.0.1:<port>` or `http://localhost:<port>`.
- Authentication uses a bearer token shown by Patina Settings.
- The protocol is not a cloud sync, account, analytics, or remote ingestion API.

## Endpoint

```http
POST /web-activity
Authorization: Bearer <token>
Content-Type: application/json
```

## Request Body

The browser extension sends a JSON object using camelCase fields:

```json
{
  "protocolVersion": 1,
  "browserClientId": "uuid-or-client-id",
  "browserKind": "chrome",
  "extensionVersion": "0.1.1",
  "tabId": 1,
  "windowId": 1,
  "url": "https://example.com/page",
  "title": "Example Page",
  "favIconUrl": "https://example.com/favicon.ico",
  "incognito": false,
  "capturedAtMs": 1710000000000,
  "eventReason": "tab-activated"
}
```

Patina currently stores domain-level web activity by default. Full page URL is not persisted by the default sanitizer.

## Ignored Inputs

Patina ignores or rejects records when:

- the token is missing or invalid
- Web Sync is disabled in Patina
- the URL is missing or invalid
- the URL scheme is not `http` or `https`
- the browser tab is incognito/private

## Response Shape

Successful response:

```json
{
  "ok": true,
  "enabled": true,
  "changed": true,
  "serverTimeMs": 1710000000000
}
```

Disabled response:

```json
{
  "ok": false,
  "enabled": false,
  "code": "web-recording-disabled",
  "message": "Patina web recording is off.",
  "serverTimeMs": 1710000000000
}
```

Error responses use `ok: false`, a stable `code`, and a human-readable `message`.

## Change Policy

Protocol changes should be receiver-compatible first:

1. Patina accepts the old and new client shapes.
2. Patina Web Sync starts sending the new shape.
3. Old compatibility is removed only after a separate compatibility decision.

Firefox AMO signing and browser store review can make extension rollout slower than Patina releases, so Patina should avoid requiring a same-day extension upgrade for ordinary desktop updates.
