# Architecture

## Ownership

Patina Web Sync owns the browser-side client. Patina owns the receiver, validation, storage, and desktop presentation.

The boundary is intentionally simple:

```text
Browser extension -> local HTTP POST -> Patina desktop app -> local Patina data model
```

This repository must not grow a Patina data layer, remote backend, or desktop-app runtime. It should remain a browser extension project with a small amount of build and release automation.

## Repository Layout

- `src/chromium/`: Chromium-family Manifest V3 extension target.
- `src/firefox/`: Firefox WebExtension target.
- `scripts/`: validation, build, package, and signing helpers.
- `store-assets/`: browser store listing assets.
- `docs/product-principles-and-scope.md`: product boundary and scope rules.
- `docs/architecture.md`: long-term owner and module boundary rules.
- `docs/engineering-quality.md`: validation, privacy, release, and cross-browser quality rules.
- `docs/quiet-pro-component-guidelines.md`: lightweight extension UI design rules.
- `docs/versioning-and-release-policy.md`: extension versioning and release rules.
- `docs/web-activity-protocol.md`: local protocol shared with Patina.

## Runtime Flow

1. The background script observes browser events such as install, startup, tab activation, tab update, window focus, and periodic alarms.
2. The extension reads the active trackable tab from the last focused browser window.
3. The extension builds a protocol payload with active-tab metadata, extension version, browser kind, client id, tab/window ids, capture time, and event reason.
4. The extension sends the payload to `http://127.0.0.1:<port>/web-activity` with `Authorization: Bearer <token>`.
5. Patina accepts, rejects, stores, sanitizes, and displays the record according to Patina-owned rules.
6. The extension stores only lightweight local connection status so the popup/options UI can explain what happened.

## Browser Target Rules

Chromium and Firefox targets should provide the same user behavior unless a browser API difference requires a target-specific implementation.

Chromium-specific behavior may use Chromium-only APIs such as the `favicon` permission and cached favicon URL lookup.

Firefox-specific behavior must preserve the stable `browser_specific_settings.gecko.id` value. The Firefox manifest version must never be rolled back for the same Gecko id once an AMO-signed version has been produced.

## Protocol Boundary

The protocol contract lives in [`web-activity-protocol.md`](./web-activity-protocol.md).

Patina Web Sync may add client-side fields only after confirming Patina can safely ignore or accept them. Patina should accept older client payloads before this extension starts requiring a newer Patina version.

Do not introduce same-day lockstep release requirements between Patina and Patina Web Sync for ordinary desktop updates.

## Privacy And Security Boundary

The extension should continue to avoid content scripts unless there is a clear, reviewed reason to add them.

The extension must not read page body content, form values, passwords, screenshots, clipboard contents, cookies, download history, or browser history databases.

Connection secrets are local Patina bearer tokens entered by the user. The extension should store them only in browser extension local storage and use them only for local Patina requests.

Network permissions should remain limited to `http://127.0.0.1/*` and `http://localhost/*` unless the product boundary is explicitly changed.
