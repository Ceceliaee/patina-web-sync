# AGENTS.md

This repository is the standalone public companion extension project for Patina Web Sync.

These instructions apply to the whole repository unless the user gives an explicit task-specific override.

## Always Read First

- Product direction and scope must follow `docs/product-principles-and-scope.md`.
- Architecture and ownership decisions must follow `docs/architecture.md`.
- Engineering quality decisions must follow `docs/engineering-quality.md`.
- Extension UI work must follow `docs/quiet-pro-component-guidelines.md`.
- Versioning, packaging, AMO signing, and release work must follow `docs/versioning-and-release-policy.md`.
- Patina bridge compatibility must follow `docs/web-activity-protocol.md`.
- Treat top-level long-lived docs under `docs/` as the current source of truth.

## Local Skills

This repository carries a small `.agents/skills/` set tailored to Patina Web Sync:

- `documentation-writer`: use for README, long-lived docs, changelog, protocol, and working/archive documentation.
- `web-extension-maintainer`: use for manifests, background scripts, build/package scripts, GitHub Actions, AMO signing, and versioning.
- `extension-ui-design`: use for popup/options HTML/CSS/JS and setup/status interaction changes.

Do not copy Patina desktop-only skills such as Tauri or SQLite maintenance into this repository unless the project scope changes explicitly.

## Project Boundary

- This repository owns the browser-side Patina Web Sync extension clients.
- `src/chromium/` owns the Chromium-family extension target.
- `src/firefox/` owns the Firefox-family extension target.
- `scripts/` owns local validation, build, packaging, and signing helpers.
- `store-assets/` owns browser-store listing assets.
- Patina owns the desktop app, local HTTP receiver, token validation, SQLite storage, backup/restore, cleanup, History, Data, Settings, and Classification read models.

## Hard Rules

- Do not expand Patina Web Sync into a cloud sync, account, analytics, team workspace, remote ingestion, or SaaS project.
- Do not add remote host permissions or remote fetch targets unless the product boundary is explicitly changed first.
- Keep extension host permissions limited to `http://127.0.0.1/*` and `http://localhost/*`.
- Do not read page body content, form values, passwords, screenshots, clipboard contents, cookies, download history, or browser history databases.
- Do not move Patina desktop app runtime, storage, or read-model logic into this repository.
- Do not reintroduce this extension source into the Patina main repository as a coupled release asset.

## Browser Target Rules

- Keep Chromium and Firefox user behavior aligned unless browser APIs or store rules force a target-specific implementation.
- Keep Firefox `browser_specific_settings.gecko.id` stable as `web-sync@patina.local`.
- Firefox manifest versions must only move forward for the stable Gecko id after AMO signing has happened.
- Chromium may use Chromium-specific favicon APIs; Firefox must not request Chromium-only permissions.
- If a protocol shape changes, keep Patina receiver compatibility first and update `docs/web-activity-protocol.md`.

## Version And Release Rules

- Keep `package.json`, `src/chromium/manifest.json`, and `src/firefox/manifest.json` versions aligned.
- Use `npm run check:versions` to verify version alignment.
- Keep `package.json` `private: true` unless npm publication becomes an explicit release goal.
- Do not run `npm run extension:firefox:sign` unless preparing a real Firefox release with a forward manifest version.
- `npm run release:check` may create local unsigned/package artifacts, but it must not perform AMO signing.
- User-facing Firefox release assets must be signed `.xpi` files; unsigned Firefox zip files are development artifacts only.
- If a GitHub Release already exists for a version, do not try to re-sign the same Firefox manifest version.

## Validation

Default validation before committing code or release-flow changes:

```bash
npm run check
```

For packaging or release-flow changes, also run:

```bash
npm run release:check
```

If validation cannot be run, clearly record the reason in the final response.

## Git And Release Hygiene

- This is a personal public repository. When the user asks to push confirmed changes, commit the confirmed scope and push directly to `origin/main`.
- Do not create a branch or pull request unless the user explicitly asks for one.
- Do not use issue-closing keywords such as `Closes`, `Fixes`, or `Resolves` unless the user explicitly asks to close an issue.
- Do not commit generated artifacts from `dist/`, `dist-release/`, `web-ext-artifacts/`, or local secret directories.
- Do not commit AMO credentials or local tokens.

## Documentation Hygiene

- Top-level `docs/` is for active long-lived reference documents only.
- One-off execution plans should not stay in top-level `docs/`; archive them under `docs/archive/` if this repository starts using execution plans.
- When a long-lived rule changes, update the relevant top-level doc instead of scattering the rule across README-only notes.
- Keep README focused on project orientation and common commands; put durable policy in `docs/`.

## Encoding Rules

- Markdown, JSON, JavaScript, TypeScript, HTML, and workflow files must be saved as UTF-8.
- Preserve readable Chinese text in `README.zh-CN.md` and target-specific Chinese docs.
- Do not rewrite documentation through shell redirection patterns that may damage encoding.
