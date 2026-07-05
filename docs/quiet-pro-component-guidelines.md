# Quiet Pro Component Guidelines

## Purpose

This is a lightweight Quiet Pro guide for Patina Web Sync browser extension UI.

It adapts Patina's calm desktop-product baseline to small extension surfaces: popup, options page, setup copy, connection status, and simple controls. It is intentionally smaller than Patina's desktop UI system.

## Design Baseline

Patina Web Sync UI should feel:

- quiet
- trustworthy
- compact
- readable
- utilitarian
- local-first

The UI should help users configure a local Patina connection and understand sync status. It should not feel like a landing page, dashboard, marketing surface, or standalone productivity app.

## Surface Rules

Use the popup for quick status and immediate actions.

Use the options page for setup fields, saved connection details, and test/send actions.

Avoid adding new screens unless the user flow genuinely needs them. Browser extension UI has a small attention budget; prefer one clear task per surface.

## Visual Rules

- Prefer system fonts and browser-native readability.
- Use CSS variables for recurring colors, spacing, borders, and radii.
- Keep radius, borders, and shadows restrained.
- Keep text sizes modest and stable.
- Avoid large gradients, glow, glassmorphism, blur-heavy panels, decorative backgrounds, and animated visual effects.
- Do not load remote fonts, icon packs, images, scripts, analytics, or styles.

A little warmth is fine, but surrounding chrome should stay neutral and durable.

## Layout Rules

- Keep forms vertically scannable.
- Keep labels close to their inputs.
- Keep buttons predictable: primary for save/test, secondary for navigation or reset.
- Keep status messages in stable slots so the popup/options layout does not jump.
- Keep the popup compact enough for repeated browser use.
- Do not use cards inside cards. Use simple sections and separators instead.

## Interaction States

Controls should have clear states where relevant:

- default
- hover
- active
- focus
- disabled
- loading or pending
- success
- warning
- error

Status must not rely on color alone. Pair color with readable text.

## Copy Rules

Use plain, local-first language.

Prefer:

- "Connected to Patina"
- "Patina Web Sync is waiting for a port and token"
- "Open Patina Settings to copy the local port and token"

Avoid language that implies cloud sync, account sync, remote upload, analytics, or team tracking.

## Accessibility Rules

- Every input needs a visible label.
- Keyboard focus should be visible.
- Buttons should be reachable and understandable by keyboard.
- Error text should explain the next useful action.
- Text should remain readable at browser extension popup sizes.

## Browser Target Rules

Chromium and Firefox UI should remain visually and behaviorally aligned unless browser platform differences force a split.

When changing shared UI copy or interaction behavior, update both targets unless there is a documented target-specific reason.

## Validation

After UI changes, run:

```bash
npm run check
```

For changes that affect packaging, manifests, scripts, or release assets, also run:

```bash
npm run release:check
```
