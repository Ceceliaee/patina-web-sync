# Patina Web Sync Store Listing

This is the shared source for Chrome Web Store, Firefox AMO, and Microsoft Edge Add-ons listing copy.

Use store-specific sections when filling dashboards. Keep this file, `PRIVACY.md`, and `docs/store-reviewer-test-instructions.md` aligned with the submitted package.

## Shared Product Copy

Name:

Patina Web Sync

Short description / summary:

Sync the active webpage to the Patina desktop app for local-first time tracking.

Category:

Productivity

Pricing:

Free. No paid features, no paid service, and no account system.

Mature content:

No.

Description:

Patina Web Sync is the browser companion for Patina, a local-first desktop time tracking app.

The extension syncs the non-private active webpage to the Patina desktop app running on your computer. This helps Patina complete desktop time records with website context, while keeping your activity local.

Patina Web Sync sends only the non-private active webpage's website address, page title, and website icon information to your local Patina app. Incognito/private/InPrivate tabs are filtered in the extension before any local sync request is sent. It connects only to local addresses such as `127.0.0.1` or `localhost`.

It does not read page content, form values, passwords, screenshots, clipboard contents, cookies, download history, or the browser history database.

Patina Web Sync requires the Patina desktop app to be installed and Web Sync to be enabled in Patina settings.

Key features:

- Sync the active webpage to local Patina.
- Keep website activity records on your own computer.
- Use a local port and token for pairing with Patina.
- Show whether the current page has synced.
- Support regular website pages using `http` and `https`.
- Skip incognito/private/InPrivate tabs before sending any local sync request.

## Privacy Policy

Use the shared public repository privacy policy:

```text
https://github.com/Ceceliaee/patina-web-sync/blob/main/PRIVACY.md
```

Privacy summary:

Patina Web Sync handles active-tab website metadata only for non-private synced pages and sends it only to the local Patina desktop app. It does not send synced webpage data to the developer, cloud services, or third-party servers.

## Permission Justifications

Chromium and Edge:

- `tabs`: read the active tab's website address, title, icon reference, tab ID, and window ID so non-private active webpages can be synced to local Patina, and detect incognito/InPrivate tabs so they can be skipped.
- `favicon`: read the browser's local favicon cache so Patina can display the website icon.
- `storage`: store local connection settings, language preference, and recent sync status in browser extension storage.
- `alarms`: refresh the active tab sync state at lightweight intervals.
- Host permissions for `http://127.0.0.1/*` and `http://localhost/*`: send sync requests only to the Patina desktop app running on the user's own computer.

Firefox:

- `tabs`: read the active tab's website address, title, icon reference, tab ID, and window ID so non-private active webpages can be synced to local Patina, and detect private tabs so they can be skipped.
- `storage`: store local connection settings, language preference, and recent sync status in browser extension storage.
- `alarms`: refresh the active tab sync state at lightweight intervals.
- Host permissions for `http://127.0.0.1/*` and `http://localhost/*`: send sync requests only to the Patina desktop app running on the user's own computer.

Firefox does not request the Chromium-only `favicon` permission.

## Chrome Web Store

Package:

```text
dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip
```

Product details:

- Name: Patina Web Sync
- Short description: use the shared short description.
- Category: Productivity
- Language: Simplified Chinese by default; English copy is available in this file.
- Mature content: No.

Privacy practices:

- Single purpose: sync metadata for the active browser tab to the local Patina desktop app so Patina can include website activity in local time records.
- Remote code: No remote code is used.
- Data disclosure: disclose web browsing activity because the extension handles the non-private active webpage's website address, title, and website icon information. Incognito/private tabs are skipped before any local sync request is sent.
- Privacy policy URL: use the shared privacy policy URL.

Assets:

- Store icon: `src/chromium/icons/icon-128.png`
- Screenshot: use `store-assets/screenshot-options-zh-CN-light.png` or `store-assets/screenshot-options-zh-CN-dark.png` for the Simplified Chinese listing, and `store-assets/screenshot-options-en-light.png` or `store-assets/screenshot-options-en-dark.png` for the English listing. Export to 1280x800 before Chrome upload if exact dimensions are required.
- Small promo tile: `store-assets/small-promo-tile.png`
- Optional marquee promo tile: `store-assets/marquee-promo-tile.png`
- Optional YouTube feature video: defer unless the dashboard requires it.

Submit strategy:

Use deferred publishing for the first review when available. Do not publish if dashboard warnings mention privacy, permissions, remote code, or package validity.

## Firefox AMO

Distribution:

Listed on AMO, using `On this site`.

Do not use the repository's unlisted signing helper as the listed AMO submission flow.

Package:

Use the Firefox package accepted by the AMO listed submission UI. The local unsigned development package is generated at:

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.zip
```

Product details:

- Name: Patina Web Sync
- Summary: use the shared short description.
- Categories: Productivity
- License: MIT
- Requires payment, non-free services, or additional hardware: No.
- Experimental: No, unless the first AMO dashboard submission or reviewer feedback requires a temporary experimental flag.

Source code submission decision:

Current package files are not minified, bundled, obfuscated, or generated from a separate source tree. The uploaded extension files are the readable source files under `src/firefox/`.

If AMO asks for source code, provide this repository source and the following build commands:

```bash
npm ci
npm run extension:firefox:package
```

Expected output:

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.zip
```

Support:

- Support website: `https://github.com/Ceceliaee/patina/issues`
- Support email: use the support website unless AMO requires an email address in the developer profile.

## Microsoft Edge Add-ons

Edge currently reuses the Chromium-family extension target unless Partner Center review requires a documented Edge-specific change.

Account status:

Microsoft Edge Partner Center developer account access is currently deferred because registration was blocked. Do not block Chrome Web Store or Firefox AMO readiness on Edge account access.

Package:

Use the Chromium-family package unless Edge requires a target-specific manifest:

```text
dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip
```

Product details:

- Name: Patina Web Sync
- Short description: use the shared short description.
- Category: Productivity
- Pricing: Free. No paid features, no paid service, and no account system.

Assets:

- Extension logo: `store-assets/edge-logo-300.png`
- Screenshot: use the `zh-CN` screenshots for the Simplified Chinese listing and the `en` screenshots for the English listing. Export to the Partner Center-required size if exact dimensions are required.
- Small promotional tile: `store-assets/small-promo-tile.png`
- Optional large promotional tile: `store-assets/marquee-promo-tile.png`

## Reviewer Notes

Use the shared reviewer test instructions:

```text
https://github.com/Ceceliaee/patina-web-sync/blob/main/docs/store-reviewer-test-instructions.md
```

Short reviewer note:

Patina Web Sync requires the Patina desktop app on the same computer. There is no account system and no test login. Enable Web Sync in Patina Settings, copy the local port and token into the extension options page, then sync a regular `https` webpage. The extension only connects to `127.0.0.1` or `localhost`. Incognito/private/InPrivate tabs are skipped before any local Web Sync request is sent.
