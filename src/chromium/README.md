# Patina Web Sync

Chromium MV3 extension companion for Patina.

This file documents the extension project itself. User-facing setup instructions live in Patina Settings.

Simplified Chinese project README: [`README.zh-CN.md`](./README.zh-CN.md).

## Purpose

Patina Web Sync sends the active webpage from a Chromium-based browser to the local Patina desktop app, so Patina can include website activity in local-first time records.

## Current Distribution

Install Patina Web Sync from the [Chrome Web Store](https://chromewebstore.google.com/detail/patina-web-sync/gimdckblhckibmeklhemgccabmbnoemd) or [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/gogmlpjhbfjghilmpcciedplifdiibai).

GitHub Releases provide the versioned Chromium zip as a manual-install fallback. Store listing source material is maintained in the repository-level `STORE_LISTING.md`.

## Source Layout

- `manifest.json`: Chromium MV3 extension manifest.
- `background.js`: service worker for active-tab sync and local Patina requests.
- `popup.html` / `popup.js`: browser action popup.
- `options.html` / `options.js`: extension options page.
- `icons/`: extension icons.

## Maintainer Workflow

Check the extension source:

```bash
npm run extension:chromium:check
```

Build the unpacked extension:

```bash
npm run extension:chromium:build
```

Build the release zip:

```bash
npm run extension:chromium:package
```

The uploadable zip is generated at:

```text
dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip
```

The version in the file name comes from `manifest.json`.
The zip root contains `manifest.json`. For manual installation, extract the zip, load that directory from the browser extension page, and follow the Web Sync instructions in Patina Settings.

## Scope

- Sends the non-private active page's complete URL, title, favicon information, protocol `incognito: false` flag, local browser client id, browser kind, and extension version to local Patina. Tab/window id, timestamps, and event reason stay out of the payload.
- Filters incognito/private tabs in the extension before any local Web Sync request is sent.
- Uses one local HTTP POST when the active tab changes; Patina handles timing from its foreground app tracker.
- Uses the browser's local favicon cache to turn active-tab icons into local data for icon colors.
- Does not read page DOM, form values, screenshots, clipboard, history database, or page content.
- Stores extension configuration in the browser's local extension storage.

## Browser Store Resources

- Shared privacy policy: [`../../PRIVACY.md`](../../PRIVACY.md)
- Shared store listing source: [`../../STORE_LISTING.md`](../../STORE_LISTING.md)
