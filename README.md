# Patina Web Sync

Patina Web Sync is the browser extension companion for [Patina](https://github.com/Ceceliaee/patina), a local-first Windows desktop time tracking app.

The extension sends the current active webpage to the Patina app running on the same computer. Patina uses that local signal to add website context to desktop time records.

## Scope

- Public companion project for Patina.
- Chromium-family and Firefox-family browser extension targets.
- Local-only communication with Patina through `127.0.0.1` or `localhost`.
- No account system, cloud sync, team workspace, analytics service, or remote data collection.

## Privacy Boundary

When configured, the extension sends only active-tab metadata needed by Patina:

- webpage URL and title
- favicon reference or local favicon data where supported
- browser kind, tab/window id, extension version, capture time, and `incognito: false` state for non-private synced tabs

Incognito/private tabs are filtered in the extension before any local Web Sync request is sent.

It does not read page body content, form values, passwords, screenshots, clipboard contents, cookies, download history, or the browser history database.

## Repository Layout

- `src/chromium/`: Chromium MV3 extension target.
- `src/firefox/`: Firefox WebExtension target.
- `scripts/`: validation, build, package, and signing helpers.
- `store-assets/`: store listing assets.
- `docs/product-principles-and-scope.md`: long-term product boundary and scope rules.
- `docs/architecture.md`: long-term browser extension architecture and ownership boundaries.
- `docs/engineering-quality.md`: validation, privacy, release, and cross-browser quality rules.
- `docs/quiet-pro-component-guidelines.md`: lightweight Quiet Pro rules for popup/options UI.
- `docs/versioning-and-release-policy.md`: versioning, packaging, AMO signing, and release rules.
- `docs/web-activity-protocol.md`: local protocol between Patina and this extension.

## Development

Install dependencies:

```bash
npm install
```

Check both extension targets:

```bash
npm run check
```

Build Chromium unpacked output:

```bash
npm run extension:chromium:build
```

Build Firefox unpacked output:

```bash
npm run extension:firefox:build
```

Package Chromium for a release asset:

```bash
npm run extension:chromium:package
```

Package Firefox unsigned development zip:

```bash
npm run extension:firefox:package
```

Firefox AMO signing is a release action, not a routine local verification step. Only run `npm run extension:firefox:sign` when preparing an actual Firefox release and after confirming the Firefox manifest version moves forward.

## User Setup

Install Patina first, then open Patina Settings and enable Web Sync. Copy the local port and token from Patina into the extension options page.

User-facing setup steps are maintained in Patina README and Patina Settings so the desktop app remains the source of truth for local configuration.
