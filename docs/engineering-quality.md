# Engineering Quality

## Purpose

This document defines the quality bar for Patina Web Sync as a small browser extension companion project.

Quality here means preserving the privacy boundary, keeping browser targets predictable, making release failures obvious before signing, and avoiding unnecessary project weight.

## Core Quality Principles

- Keep the extension local-only and privacy-preserving by default.
- Prefer explicit validation scripts over reviewer memory for stable invariants.
- Keep Chromium and Firefox behavior aligned unless browser APIs force divergence.
- Keep release steps repeatable, version-aware, and safe around Firefox AMO signing.
- Keep the repository small. Add abstraction only when it removes real duplication or encodes a stable boundary.

## Required Validation

Default validation before commits:

```bash
npm run check
```

This must include:

- version consistency across `package.json` and both manifests
- Chromium extension shape and permission checks
- Firefox extension shape, permission, and Gecko id checks

For changes touching manifests, package scripts, release workflow, signing, packaging, or asset naming, also run:

```bash
npm run release:check
```

`release:check` may produce local package artifacts. It must not perform AMO signing.

## Browser Extension Invariants

Validation and review should protect these invariants:

- `manifest_version` stays on the supported extension platform version for each target.
- Host permissions remain limited to `http://127.0.0.1/*` and `http://localhost/*`.
- Content security policy does not add remote fetch targets.
- Chromium-only APIs and permissions stay in the Chromium target.
- Firefox keeps `browser_specific_settings.gecko.id` set to `web-sync@patina.local`.
- Firefox does not request Chromium-only permissions such as `favicon`.
- Both targets keep popup, options, icons, and background entry points valid.

## Privacy And Data Handling

Do not add capabilities that read page body content, form values, passwords, screenshots, clipboard contents, cookies, download history, or browser history databases.

The extension should send only active-tab metadata needed by Patina. If a future change needs more data, document the user benefit, privacy cost, browser permissions, and Patina receiver compatibility before implementing it.

Local connection secrets are Patina bearer tokens. Do not log them, commit them, or send them anywhere except the local Patina bridge request.

## Cross-Browser Parity

A change should normally keep Chromium and Firefox user behavior aligned.

When behavior must differ:

- document the browser API or store-policy reason in the implementation or release notes
- keep the shared protocol payload compatible
- keep user-facing setup copy consistent across browser targets
- update validation scripts if the difference becomes a stable invariant

## Release Quality

Release changes must protect against signing or publishing the wrong version:

- `npm run check:versions` must pass before packaging or publishing.
- Git tag, package version, Chromium manifest version, Firefox manifest version, release title, and asset names must agree.
- Do not re-sign the same Firefox manifest version after AMO has accepted it.
- Do not publish unsigned Firefox zip files as user-facing release assets.
- Keep generated `dist/`, `dist-release/`, and `web-ext-artifacts/` files out of git.

## Code Change Style

Prefer direct, readable JavaScript and TypeScript. The repository is intentionally compact, so avoid framework migrations, bundlers, or shared infrastructure unless they solve a concrete maintenance problem.

For scripts, make failure messages specific enough that a future maintainer knows which file or invariant broke.

For UI files, keep inline behavior simple and avoid remote dependencies. Extension pages should work under the current content security policy.

## Documentation Quality

When a quality rule becomes durable, update the relevant long-lived document instead of leaving it only in a temporary plan or commit message.

Use `AGENTS.md` for repository-wide collaboration rules. Use this document for engineering quality rules that should guide implementation and review.
