# Patina Web Sync

Patina 的 Chromium MV3 浏览器扩展伴随项目。

本文档说明扩展项目本身。面向用户的网页同步配置说明放在 Patina 设置页中。

英文项目说明见 [`README.md`](./README.md)。

## 用途

Patina Web Sync 会把 Chromium 系浏览器中的当前活动网页同步到本机 Patina，让 Patina 可以把网页活动纳入本地优先的时间记录。

## 当前分发方式

请通过 [Chrome 应用商店](https://chromewebstore.google.com/detail/patina-web-sync/gimdckblhckibmeklhemgccabmbnoemd) 或 [Microsoft Edge 加载项](https://microsoftedge.microsoft.com/addons/detail/gogmlpjhbfjghilmpcciedplifdiibai)安装 Patina Web Sync。

GitHub Releases 提供带版本号的 Chromium zip，作为无法使用商店时的手动安装后备。商店页源文案统一维护在仓库根目录的 `STORE_LISTING.md`。

## 源码结构

- `manifest.json`：Chromium MV3 扩展 manifest。
- `background.js`：用于活动标签页同步和本地 Patina 请求的 service worker。
- `popup.html` / `popup.js`：浏览器操作弹窗。
- `options.html` / `options.js`：扩展选项页。
- `icons/`：扩展图标。

## 维护流程

检查扩展源码：

```bash
npm run extension:chromium:check
```

构建未打包扩展：

```bash
npm run extension:chromium:build
```

构建发布 zip：

```bash
npm run extension:chromium:package
```

可上传的 zip 会生成在：

```text
dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip
```

文件名中的版本号来自 `manifest.json`。
zip 根目录直接包含 `manifest.json`。手动安装时，解压 zip，在浏览器扩展页加载解压目录，并在 Patina 设置页中继续查看网页同步说明。

## 范围

- 只向本机 Patina 发送非私密活动标签页的完整 URL、标题、favicon 信息、协议 `incognito: false` 标记、本机浏览器客户端标识、浏览器类型和扩展版本；不发送标签页/窗口 ID、采集时间或事件原因。
- 无痕/私密标签页会在扩展端发送本机网页同步请求之前被过滤。
- 活动标签页变化时使用一次本地 HTTP POST；时间归属由 Patina 的前台应用追踪器处理。
- 使用浏览器本地 favicon 缓存，把活动标签页图标转成本地数据用于图标颜色。
- 不读取页面 DOM、表单值、截图、剪贴板、浏览历史库或网页正文。
- 扩展配置保存在浏览器的本地扩展存储中。

## 浏览器商店资料

- 共用隐私政策：[`../../PRIVACY.md`](../../PRIVACY.md)
- 共用商店页源文案：[`../../STORE_LISTING.md`](../../STORE_LISTING.md)
