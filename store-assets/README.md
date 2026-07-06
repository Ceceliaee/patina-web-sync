# Browser Store Assets

Place browser store listing assets in this folder.

Current assets:

- `screenshot-options-zh-CN-light.png`: 960x600 PNG of the Chinese extension options page in light mode.
- `screenshot-options-zh-CN-dark.png`: 960x600 PNG of the Chinese extension options page in dark mode.
- `screenshot-options-en-light.png`: 960x600 PNG of the English extension options page in light mode.
- `screenshot-options-en-dark.png`: 960x600 PNG of the English extension options page in dark mode.
- `small-promo-tile.png`: 440x280 PNG or JPEG. Used for Chrome Web Store and reusable for Edge.
- `edge-logo-300.png`: 300x300 PNG generated from the extension icon for Microsoft Edge Add-ons.

Chrome Web Store assets:

- Store icon: supplied by `src/chromium/icons/icon-128.png`.
- At least one screenshot per listing locale: use the `zh-CN` screenshots for the Simplified Chinese listing and the `en` screenshots for the English listing.
- The options screenshots are 16:10 but currently 960x600. Export Chrome uploads at 1280x800 if the dashboard requires exact dimensions.
- Small promo tile: `small-promo-tile.png`.
- Optional marquee promo tile: `marquee-promo-tile.png`, 1400x560 PNG or JPEG.
- Optional YouTube video: defer unless the dashboard requires it.

Microsoft Edge Add-ons assets:

- Extension logo: use `edge-logo-300.png`.
- Screenshot: use the `zh-CN` screenshots for the Simplified Chinese listing and the `en` screenshots for the English listing, exporting to the Partner Center-required size if exact dimensions are required.
- Small promotional tile: `small-promo-tile.png`.
- Optional large promotional tile: `marquee-promo-tile.png`, 1400x560 PNG.

Firefox AMO assets:

- Listing assets are optional for the first submission. Reuse the localized options-page screenshots and icon assets only if AMO asks for them or if the listing needs visual polish.

Asset rules:

- Do not include real tokens.
- Do not include private URLs.
- Do not include personal desktop information.
- Use clean test pages and clean Patina data.

These files are for browser store upload only. They are not bundled into the extension package.
