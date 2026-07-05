---
name: web-extension-maintainer
description: Use this skill whenever modifying Patina Web Sync browser extension code, manifests, permissions, build scripts, package scripts, GitHub Actions, release assets, AMO signing flow, or versioning. This is the main engineering skill for the standalone extension repository.
---

# Patina Web Sync WebExtension Maintainer

Use this skill for engineering work in the Patina Web Sync repository.

## Read First

Before changing extension behavior or release logic, read:

1. `AGENTS.md`
2. `docs/product-principles-and-scope.md`
3. `docs/architecture.md`
4. `docs/versioning-and-release-policy.md`
5. `docs/web-activity-protocol.md`

Let those files decide product scope, ownership, versioning, and protocol compatibility.

## Repository Ownership

This repository owns only the browser-side client:

- `src/chromium/` for Chromium-family extension code.
- `src/firefox/` for Firefox-family extension code.
- `scripts/` for validation, build, package, and signing helpers.
- `.github/workflows/` for extension repository CI and release automation.
- `store-assets/` for browser-store assets.

Patina owns the local receiver, token validation, storage, backup/restore, cleanup, and desktop read models. Do not move those responsibilities here.

## Privacy And Permissions

Preserve the local-only privacy boundary:

- Host permissions stay limited to `http://127.0.0.1/*` and `http://localhost/*`.
- Do not add remote fetch targets without an explicit product-direction change.
- Do not read page body content, form values, passwords, screenshots, clipboard contents, cookies, download history, or browser history databases.
- Avoid content scripts unless the user explicitly asks and the privacy impact is documented.

When permissions change, update the relevant README/privacy/store docs and validation scripts.

## Browser Target Rules

Keep Chromium and Firefox behavior aligned unless browser APIs force a difference.

Chromium may use Chromium-specific APIs such as the `favicon` permission and local favicon cache lookup.

Firefox must preserve:

- `browser_specific_settings.gecko.id`: `web-sync@patina.local`
- Forward-only manifest versions once AMO signing has occurred for the stable Gecko id
- No Chromium-only `favicon` permission

## Protocol Rules

The extension sends active-tab metadata to `POST /web-activity` on the local Patina bridge.

If payload shape, auth behavior, endpoint behavior, or compatibility policy changes, update `docs/web-activity-protocol.md` and ensure Patina can accept the old and new shapes before the extension relies on the new one.

Do not introduce lockstep same-day release requirements between Patina and Patina Web Sync for ordinary desktop updates.

## Version And Release Rules

Keep these versions aligned:

- `package.json`
- `src/chromium/manifest.json`
- `src/firefox/manifest.json`
- Git tag `vX.Y.Z`
- GitHub Release title and asset names

Run:

```bash
npm run check:versions
```

Do not run `npm run extension:firefox:sign` unless preparing a real Firefox release with a forward manifest version and AMO credentials.

If a GitHub Release already exists for a version, do not try to re-sign the same Firefox manifest version.

## Validation

Default validation:

```bash
npm run check
```

For changes touching scripts, manifests, workflow files, package scripts, or release policy, also run:

```bash
npm run release:check
```

`release:check` produces local unsigned/package artifacts and must not perform AMO signing.

## Change Style

Prefer small, explicit changes over shared abstractions. This repository is intentionally compact.

When adding checks, encode stable invariants in scripts so CI catches regressions: permissions, manifest shape, version consistency, package names, and local-only connection rules.

Do not commit generated artifacts from `dist/`, `dist-release/`, `web-ext-artifacts/`, or local secret directories.
