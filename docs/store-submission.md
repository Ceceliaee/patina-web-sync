# Store Submission

## Purpose

This document is the long-lived reference for preparing Patina Web Sync browser-store submissions.

Patina Web Sync should be reviewed as a local-first browser companion for the Patina desktop app. It is not a cloud sync service, account service, analytics tool, remote ingestion service, or team workspace.

## Submission Strategy

- Chrome Web Store and Firefox AMO can be prepared and submitted before Microsoft Edge Add-ons if Edge Partner Center access is blocked.
- Microsoft Edge Add-ons should reuse the Chromium-family target unless Edge review requires a documented target-specific change.
- Store listing, privacy policy, reviewer notes, and screenshots must describe the same behavior as the submitted package.
- Real store submission is a user-approved external dashboard action. Repository preparation should stop at validated package, listing copy, privacy policy, reviewer notes, and go/no-go status unless the user explicitly asks to submit.

## Current Store Candidate

The first store candidate is `0.2.0`.

This version line represents the first browser-store submission candidate after the initial independent GitHub release. It includes private/incognito tab filtering before local Web Sync requests, strict `ok: true` bridge success handling, and stronger manifest validation.

## Shared Privacy Policy

Use the repository-level privacy policy as the shared store policy URL:

```text
https://github.com/Ceceliaee/patina-web-sync/blob/main/PRIVACY.md
```

Do not keep separate target-specific privacy policy files for ordinary browser differences. Browser-specific privacy differences, such as Chromium favicon handling and Firefox not requesting the Chromium-only `favicon` permission, must be described in the shared policy and `STORE_LISTING.md`.

## Shared Store Listing Source

Use the repository-level listing source for Chrome Web Store, Firefox AMO, and Microsoft Edge Add-ons:

```text
STORE_LISTING.md
```

Do not add target-specific listing files unless a store review creates a stable browser-specific requirement that cannot be represented clearly in the shared file.

## Shared Reviewer Instructions

Use [`store-reviewer-test-instructions.md`](./store-reviewer-test-instructions.md) as the source for reviewer notes.

Every store submission should explain:

- Patina Web Sync requires the Patina desktop app on the same computer.
- There is no account system and no test login.
- Web Sync uses a local port and token from Patina Settings.
- The extension only connects to `127.0.0.1` or `localhost`.
- Incognito/private tabs are skipped before any local Web Sync request is sent.

## Chrome Web Store

Use the Chrome Web Store section in `STORE_LISTING.md` as the Chrome listing source.

Before submission:

- Run `npm run release:check`.
- Upload `dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip`.
- Fill Store Listing, Privacy, Distribution, and Test instructions.
- Use deferred publishing for the first review when available.
- Do not publish if dashboard warnings mention privacy, permissions, remote code, or package validity.

## Firefox AMO

Use the Firefox AMO section in `STORE_LISTING.md` as the AMO listing source.

For listed AMO submission:

- Choose `On this site`.
- Upload the Firefox add-on package through AMO so AMO can validate the listed submission.
- Do not treat the repository's unlisted signing helper as the listed AMO submission flow.
- If AMO asks for source code, provide source and reproducible build instructions. The current extension files are not minified or bundled.
- Treat security or privacy validator warnings as blockers until understood.

## Microsoft Edge Add-ons

Use the Microsoft Edge Add-ons section in `STORE_LISTING.md` as the Edge listing source.

While Partner Center access is blocked:

- Keep Edge submission deferred.
- Prepare Edge listing copy, assets, privacy policy URL, and reviewer notes.
- Verify the Chromium package in Edge developer mode when Edge is available locally.

When Partner Center access is restored:

- Upload the Chromium-family package unless Edge requires a target-specific manifest.
- Fill Privacy and Store listings.
- Confirm all assets meet current Partner Center requirements.

## Validation Before Any Store Upload

Run:

```bash
npm run check
npm run release:check
```

Then inspect generated packages for:

- No `.secrets`.
- No `node_modules`.
- No generated release artifacts nested inside packages.
- No remote host permissions.
- No optional permissions.
- No content scripts.
- No remote code.

## Version And Release Hygiene

- Keep `package.json`, `src/chromium/manifest.json`, and `src/firefox/manifest.json` versions aligned.
- Do not run AMO signing unless preparing a real Firefox release with a forward manifest version.
- Do not submit generated artifacts from `dist/`, `dist-release/`, or `web-ext-artifacts/`.
- Do not push a release tag unless the user explicitly approves publishing that candidate.
