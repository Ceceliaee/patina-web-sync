# Patina Web Sync

Firefox WebExtension companion for Patina.

This file documents the extension project itself. User-facing setup instructions live in Patina Settings.

Simplified Chinese project README: [`README.zh-CN.md`](./README.zh-CN.md).

## Purpose

Patina Web Sync sends the active webpage from a Firefox-family browser to the local Patina desktop app, so Patina can include website activity in local-first time records.

## Current Distribution

Patina Web Sync is currently distributed through GitHub Releases and manual local installation.
For Firefox-family browsers, the user-facing GitHub Release package is a Mozilla AMO `unlisted` signed `.xpi`.

Firefox AMO listed submission materials are kept in the repository-level `STORE_LISTING.md`, but the extension is not listed on AMO yet.

## Source Layout

- `manifest.json`: Firefox MV3 WebExtension manifest.
- `background.js`: background script for active-tab sync and local Patina requests.
- `popup.html` / `popup.js`: browser action popup.
- `options.html` / `options.js`: extension options page.
- `icons/`: extension icons.

## Maintainer Workflow

Check the extension source:

```bash
npm run extension:firefox:check
```

Build the unpacked extension:

```bash
npm run extension:firefox:build
```

Build the unsigned development zip:

```bash
npm run extension:firefox:package
```

The unsigned zip is generated at:

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.zip
```

This zip is only for local development, temporary debugging, or manual investigation. It is not uploaded as the Firefox user-facing GitHub Release asset.

Build the signed `.xpi`:

```bash
WEB_EXT_API_KEY=... WEB_EXT_API_SECRET=... npm run extension:firefox:sign
```

The signed `.xpi` is generated at:

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.xpi
```

The version in the file name comes from `manifest.json`.
Formal GitHub Releases upload only the signed `.xpi`. Users install it through Firefox Add-ons Manager's Install Add-on From File flow, then follow the Web Sync instructions in Patina Settings.

## Scope

- Sends only non-private active tab URL, title, favicon URL, protocol `incognito: false` flag, tab/window id, browser kind, and timestamps to local Patina.
- Filters incognito/private tabs in the extension before any local Web Sync request is sent.
- Uses one local HTTP POST when the active tab changes; Patina handles timing from its foreground app tracker.
- Uses the active tab metadata provided by the browser for favicon information.
- Does not read page DOM, form values, screenshots, clipboard, history database, or page content.
- Stores extension configuration in the browser's local extension storage.

## Firefox AMO Draft

- Shared privacy policy: [`../../PRIVACY.md`](../../PRIVACY.md)
- Shared store listing draft: [`../../STORE_LISTING.md`](../../STORE_LISTING.md)
