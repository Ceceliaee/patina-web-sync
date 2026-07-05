# Versioning And Release Policy

## Version Sources

Patina Web Sync is a public GitHub repository, but it is not currently published as an npm package. Keep `package.json` set to `"private": true` unless npm publication becomes an explicit release goal.

The project version should stay aligned across these sources. `npm run check:versions` enforces this locally and in CI:

- `package.json` `version`
- `src/chromium/manifest.json` `version`
- `src/firefox/manifest.json` `version`
- Git tag `vX.Y.Z`
- GitHub Release title `Patina Web Sync vX.Y.Z`

The initial standalone version is `0.1.1`, matching the current Firefox extension version and moving Chromium forward to the same version. Browser extension versions use numeric `X.Y.Z` or `X.Y.Z.N` format.

## Browser Version Rules

Chromium and Firefox manifest versions should normally move together. If a browser-specific emergency requires a target-only release, document the reason in `CHANGELOG.md` before tagging.

Firefox versions require extra care. Once a version has been signed for the stable Gecko id `web-sync@patina.local`, do not roll that manifest version backward.

Do not run AMO signing just to verify a migration or routine documentation change. Run `npm run extension:firefox:sign` only for a real Firefox release after confirming the target version moves forward.

## Validation

Default validation is:

```bash
npm run check
```

Before preparing release assets, also run:

```bash
npm run release:check
```

`npm run release:check` creates local Chromium and unsigned Firefox development packages. It does not perform AMO signing.

## Release Assets

Chromium release asset:

```text
patina-chromium-extension-vX.Y.Z.zip
```

Firefox release asset:

```text
patina-firefox-extension-vX.Y.Z.xpi
```

The Firefox `.xpi` must be produced by AMO signing for formal releases. Unsigned Firefox zip files are development artifacts only and should not be attached as user-facing release assets.

## Release Flow

1. Update `CHANGELOG.md` for the release.
2. Ensure `package.json` and both browser manifests use the same target version.
3. Run `npm run check`.
4. Run `npm run release:check` for local package verification.
5. Confirm AMO credentials are configured in the GitHub repository secrets when publishing Firefox assets.
6. Commit the release preparation changes.
7. Push tag `vX.Y.Z` or run the release workflow for an existing version tag.
8. Let GitHub Actions validate version consistency, package Chromium, sign Firefox, collect assets, and publish the GitHub Release. If `vX.Y.Z` already exists, the workflow skips publishing instead of attempting to re-sign the same Firefox manifest version.

## Relationship To Patina Releases

Patina desktop releases do not package or upload Patina Web Sync browser extension assets.

Patina README and Patina Settings may link users to this repository's release page or future browser-store listings. The extension release cadence should remain independent from the Patina desktop app unless a protocol compatibility change requires coordination.
