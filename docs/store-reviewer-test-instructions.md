# Store Reviewer Test Instructions

## Summary

Patina Web Sync is a browser extension companion for the Patina desktop app. It syncs the non-private active webpage to Patina running on the same computer so Patina can add website context to local time records.

There is no account system, no remote server, no cloud sync, and no test login. The extension only connects to the local Patina app through `127.0.0.1` or `localhost`.

## Requirements

- Windows desktop environment for the Patina desktop app.
- Patina desktop app installed from the Patina project release or built from source.
- Browser extension package installed in the browser being reviewed.
- A regular public `https` test page, such as `https://example.com/`.

Patina project:

```text
https://github.com/Ceceliaee/patina
```

Patina Web Sync source:

```text
https://github.com/Ceceliaee/patina-web-sync
```

## Setup

1. Install and open the Patina desktop app.
2. Open Patina Settings.
3. Enable Web Sync.
4. Copy the Web Sync local port and token from Patina Settings.
5. Open the Patina Web Sync extension options page.
6. Paste the local port and token into the extension options page.
7. Save or wait for the options page to save the values.

## Normal Webpage Verification

1. Open a regular `https` webpage in a normal browser window.
2. Open the Patina Web Sync popup.
3. Select Sync current page.
4. Confirm the popup or options page shows a synced state.
5. Confirm Patina records the current website activity locally.

Expected result:

- The extension sends one local `POST /web-activity` request to Patina.
- The request goes only to `127.0.0.1` or `localhost`.
- Patina records website context locally.
- No account or remote service is used.

## Private Window Verification

1. Enable the extension in incognito/private windows if the browser requires an explicit setting.
2. Open a regular `https` webpage in an incognito/private window.
3. Open the Patina Web Sync popup.

Expected result:

- The popup says the private window is not synced.
- The popup does not show that private page's title or domain.
- The extension does not send a Web Sync request for that private page.
- Patina does not receive or record that private page.

## Browser Internal Page Verification

1. Open a browser internal page such as `chrome://extensions` or `about:addons`.
2. Open the Patina Web Sync popup.

Expected result:

- The page is shown as not synced or unsupported.
- No Web Sync request is sent for the browser internal page.

## Error State Verification

Missing token:

- Clear the token in the extension options page.
- Expected result: the extension shows a needs setup state and does not sync.

Wrong port:

- Enter a local port where Patina is not listening.
- Expected result: the extension shows not synced or error, not synced.

Non-Patina local service:

- If a local service returns `2xx` without JSON `{ "ok": true }`, the extension should not show synced.

## Privacy Notes

The extension does not read page body content, form values, passwords, cookies, screenshots, clipboard contents, download history, or the browser history database.

For non-private synced pages, it sends only active-tab metadata needed by Patina:

- Website address
- Page title
- Website icon or icon URL
- Browser tab/window IDs
- Browser kind
- Extension version
- Sync timestamp
- Sync event reason
- `incognito: false`

Incognito/private tabs are skipped before any local Web Sync request is sent.
