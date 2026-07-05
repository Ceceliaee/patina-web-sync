---
name: extension-ui-design
description: Use this skill when editing Patina Web Sync popup or options HTML/CSS/JS, user-facing setup text, connection status UI, or browser extension interaction flows. Design small, restrained, accessible extension UI that supports local setup without adding remote dependencies.
---

# Patina Web Sync Extension UI Design

Use this skill for `popup.html`, `popup.js`, `options.html`, and `options.js` changes in `src/chromium/` or `src/firefox/`.

## Product Context

Patina Web Sync UI is a small browser extension surface. It should help the user configure a local Patina port/token and understand connection status.

It is not a marketing page, dashboard, or full app shell.

## UI Principles

- Keep the UI quiet, compact, and task-focused.
- Prioritize readable labels, clear status, and obvious save/test actions.
- Use stable spacing and predictable form layouts.
- Avoid decorative visual systems, large hero sections, gradients, glass effects, or animation-heavy treatments.
- Do not load remote fonts, images, scripts, analytics, or styles.
- Make status copy actionable without implying cloud sync or remote collection.

## Browser Extension Constraints

Respect extension security constraints:

- Keep scripts in separate `.js` files; do not add inline scripts.
- Keep CSS compatible with extension pages and the current content security policy.
- Do not introduce external CDN dependencies.
- Preserve local-only connection assumptions.
- Keep Chromium and Firefox UI behavior aligned unless browser APIs require a difference.

## Accessibility And Interaction

- Label every input clearly.
- Keep keyboard interaction straightforward.
- Ensure buttons and status messages remain understandable without color alone.
- Keep disabled, loading, success, warning, and error states explicit.
- Avoid layout shifts when status text changes.

## Copy Rules

Use plain language. The extension should say it sends active webpage metadata to the local Patina app, not to a cloud service.

For setup copy, point users back to Patina Settings for the authoritative port and token.

When changing English copy, update the matching Chinese README or target-specific Chinese documentation if the same user-facing instruction appears there.

## Validation

After UI changes, run:

```bash
npm run check
```

For packaging-sensitive changes, run:

```bash
npm run release:check
```

If the UI change affects only one target, still check both targets unless there is a clear reason not to.
