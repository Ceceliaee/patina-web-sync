# 浏览器商店素材

本目录存放 Patina Web Sync 的商店上传成品和可重建源图。商店成品不会进入扩展 zip。

## 目录约定

- `chrome-web-store/`：Chrome Web Store 当前上传候选。
- `firefox-amo/`：Firefox AMO 当前上传候选。
- `edge-add-ons/`：Microsoft Edge Add-ons 当前上传候选。
- `source/`：原图、历史图和未选择上传的素材；不直接上传。

当前首发策略使用少量、可验证的图片：Chrome 与 Firefox 各上传一张 options 截图；Edge 在截图仍为可选时不上传截图。现有文件不等于必须全部上传，最终选择以 `STORE_LISTING.md` 为准。

## Chrome Web Store

- `chrome-web-store/extension-icon-128.png`：`128x128`，与 Chromium 包内 `icon-128.png` 同源。
- `chrome-web-store/screenshots/01-options-ready-en-US-1280x800.png`：`1280x800`，首发上传截图。
- `chrome-web-store/small-promo-tile.png`：`440x280`。

首发省略可选的 `1400x560` marquee image 和视频。

## Firefox AMO

- `firefox-amo/icon-32.png`：`32x32`。
- `firefox-amo/icon-64.png`：`64x64`，首选 AMO icon。
- `firefox-amo/screenshots/01-options-ready-en-US-1280x800.png`：`1280x800`，首发上传截图。

Firefox 不使用 Chrome small promo tile 或 Edge `300x300` logo。

## Microsoft Edge Add-ons

- `edge-add-ons/extension-logo-300.png`：`300x300`。
- `edge-add-ons/small-promo-tile.png`：`440x280`；只在后台要求或明确选择时上传。

首发不上传 screenshot 或 `1400x560` large promotional tile。未来若上传 screenshot，只接受 Edge 中实际捕获的 `1280x800` 或 `640x480` 图片，最多 6 张。

## Source 与重建

`source/` 保存 options / popup 原图、历史截图和旧宣传图，用于未来重新导出或对照。源图可以包含浏览器 chrome，但只有通过以下 QA 的导出成品才能进入平台目录。

图标来源于对应 manifest 的包内图标。Small promo tile 来自仓库中已保存的当前导出版本。重新导出时保持原始宽高比，不拉伸、不补黑边，并在 `STORE_LISTING.md` 更新实际上传选择。

## 必过 QA

- 使用当前候选版本 UI 和公开测试页面。
- 端口使用测试值 `12345`；Token 使用假值且始终遮罩。
- options 的端口、Token 和已保存状态相互一致。
- 不包含真实邮箱、手机号、地址、Token、私人 URL、通知、账号菜单或可识别浏览器 profile。
- 不展示实时 star / Issue 数或其他与扩展功能无关、会过期的数据。
- 不用 Chrome 浏览器外观冒充 Edge。
- 文字在商店缩略图中可读；图片没有拉伸、黑边、模糊、错误裁切或意外透明区域。
- 上传前运行 `npm run check:store-assets`；该命令验证 PNG 尺寸、数量和文档路径。
