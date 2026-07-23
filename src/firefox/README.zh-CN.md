# Patina Web Sync

Patina 的 Firefox 系浏览器扩展伴随项目。

本文档说明扩展项目本身。面向用户的网页同步配置说明放在 Patina 设置页中。

英文项目说明见 [`README.md`](./README.md)。

## 用途

Patina Web Sync 会把 Firefox 系浏览器中的当前活动网页同步到本机 Patina，让 Patina 可以把网页活动纳入本地优先的时间记录。

## 当前分发方式

请通过 [Firefox 附加组件](https://addons.mozilla.org/zh-CN/firefox/addon/patina-web-sync/)安装 Patina Web Sync。

GitHub Releases 提供 AMO 同版本公开 listed XPI，作为无法使用商店时的手动安装后备。商店页源文案统一维护在仓库根目录的 `STORE_LISTING.md`。

## 源码结构

- `manifest.json`：Firefox MV3 WebExtension manifest。
- `background.js`：用于活动标签页同步和本地 Patina 请求的后台脚本。
- `popup.html` / `popup.js`：浏览器操作弹窗。
- `options.html` / `options.js`：扩展选项页。
- `icons/`：扩展图标。

## 维护流程

检查扩展源码：

```bash
npm run extension:firefox:check
```

构建未打包扩展：

```bash
npm run extension:firefox:build
```

构建未签名开发 zip：

```bash
npm run extension:firefox:package
```

未签名 zip 会生成在：

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.zip
```

这个 zip 只用于本地开发、临时调试或人工排查，不作为 GitHub Release 的 Firefox 用户安装附件。

正式 GitHub Release XPI 不在本地重新签名。三家商店全部公开后，Tag 工作流会从 AMO 下载同版本公开 listed XPI，并校验文件哈希、manifest version 和 Gecko ID。

只有在明确进行 unlisted 测试，并使用尚未在 AMO 占用的新版本时，才运行：

```bash
WEB_EXT_API_KEY=... WEB_EXT_API_SECRET=... npm run extension:firefox:sign
```

unlisted 测试 `.xpi` 会生成在：

```text
dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.xpi
```

文件名中的版本号来自 `manifest.json`。不得使用该 unlisted 测试命令生成 listed 商店提交包或正式 GitHub Release 附件。

## 范围

- 只向本机 Patina 发送非私密活动标签页的完整 URL、标题、favicon URL 和协议 `incognito: false` 标记；不发送标签页/窗口 ID、采集时间或事件原因。Firefox 142+ 只有在用户允许可选技术数据后，才发送本机浏览器客户端标识、浏览器类型和扩展版本。
- 无痕/私密标签页会在扩展端发送本机网页同步请求之前被过滤。
- 活动标签页变化时使用一次本地 HTTP POST；时间归属由 Patina 的前台应用追踪器处理。
- 使用浏览器提供的活动标签页元数据记录网站图标信息。
- 不读取页面 DOM、表单值、截图、剪贴板、浏览历史库或网页正文。
- 扩展配置保存在浏览器的本地扩展存储中。

## Firefox 附加组件资料

- 共用隐私政策：[`../../PRIVACY.md`](../../PRIVACY.md)
- 共用商店页源文案：[`../../STORE_LISTING.md`](../../STORE_LISTING.md)
