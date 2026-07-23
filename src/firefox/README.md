# Patina Web Sync

Firefox WebExtension companion for Patina.

This file documents the extension project itself. User-facing setup instructions live in Patina Settings.

Simplified Chinese project README: [`README.zh-CN.md`](./README.zh-CN.md).

## Purpose

Patina Web Sync sends the active webpage from a Firefox-family browser to the local Patina desktop app, so Patina can include website activity in local-first time records.

## Current Distribution

Install Patina Web Sync from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/patina-web-sync/).

GitHub Releases mirror the same-version public listed AMO `.xpi` as a manual-install fallback. Store listing source material is maintained in the repository-level `STORE_LISTING.md`.

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

The formal GitHub Release XPI is not signed locally. After all three stores are public, the tag workflow downloads the same-version public listed XPI from AMO and verifies its hash, manifest version, and Gecko ID.

For explicit unlisted testing only, with a new version that has not already been used on AMO:

```bash
WEB_EXT_API_KEY=... WEB_EXT_API_SECRET=... npm run extension:firefox:sign
```

The unlisted test `.xpi` is generated at:

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.xpi
```

The version in the file name comes from `manifest.json`. Do not use this unlisted test helper to create a listed store submission or formal GitHub Release asset.

## Scope

- Sends the non-private active page's complete URL, title, favicon URL, and protocol `incognito: false` flag to local Patina. Tab/window id, timestamps, and event reason stay out of the payload. Firefox 142+ sends the local browser client id, browser kind, and extension version only after optional technical-data consent.
- Filters incognito/private tabs in the extension before any local Web Sync request is sent.
- Uses one local HTTP POST when the active tab changes; Patina handles timing from its foreground app tracker.
- Uses the active tab metadata provided by the browser for favicon information.
- Does not read page DOM, form values, screenshots, clipboard, history database, or page content.
- Stores extension configuration in the browser's local extension storage.

## Firefox Add-ons Resources

- Shared privacy policy: [`../../PRIVACY.md`](../../PRIVACY.md)
- Shared store listing source: [`../../STORE_LISTING.md`](../../STORE_LISTING.md)
