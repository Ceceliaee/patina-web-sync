# 架构

## 所有权

Patina Web Sync 拥有浏览器侧客户端。Patina 拥有接收端、校验、存储和桌面端展示。

边界刻意保持简单：

```text
Browser extension -> local HTTP POST -> Patina desktop app -> local Patina data model
```

本仓库不应长出 Patina 数据层、远程后端或桌面应用运行时。它应该保持为一个浏览器扩展项目，只带少量构建和发布自动化。

## 仓库结构

- `src/chromium/`：Chromium 系 Manifest V3 扩展目标，包含包内 `_locales/en` 与 `_locales/zh_CN`。
- `src/firefox/`：Firefox WebExtension 目标，包含包内 locales、稳定 Gecko id 和 Firefox 142+ 数据同意声明。
- `scripts/`：验证、构建、打包和签名辅助脚本。
- `store-assets/<store>/`：各浏览器商店可上传成品；`store-assets/source/` 只保留源图和历史图。
- `STORE_LISTING.md`：Chrome Web Store、Firefox AMO 和 Microsoft Edge Add-ons 共用商店信息草案。
- `docs/product-principles-and-scope.md`：产品边界和范围规则。
- `docs/architecture.md`：长期所有权和模块边界规则。
- `docs/engineering-quality.md`：验证、隐私、发布和跨浏览器质量规则。
- `docs/quiet-pro-component-guidelines.md`：轻量扩展 UI 设计规则。
- `docs/store-submission.md`：浏览器商店上架准备参考。
- `docs/versioning-and-release-policy.md`：扩展版本和发布规则。
- `docs/web-activity-protocol.md`：与 Patina 共享的本机协议。

## 运行流程

1. background script 监听 install、startup、tab activation、tab update、window focus 和周期性 alarm 等浏览器事件。
2. 扩展从最后聚焦的浏览器窗口读取当前可记录的活动标签页。
3. 扩展校验活动 URL 为普通 `http` / `https` 页面，再构造包含完整 URL、标题、图标信息和 `incognito: false` 的协议 payload。Chromium 携带 client id、浏览器类型和扩展版本；Firefox 只在用户授予 optional technical consent 后携带这些字段。
4. 扩展使用 `Authorization: Bearer <token>` 向 `http://127.0.0.1:<port>/web-activity` 发送 payload。
5. Patina 按 Patina 拥有的规则接收、拒绝、存储、清洗和展示记录。
6. 扩展只保存轻量的本地连接状态，供 popup/options UI 解释当前状态。

## 浏览器目标规则

Chromium 和 Firefox 目标应提供一致的用户行为，除非浏览器 API 差异需要目标专属实现。

Chromium 专属行为可以使用 Chromium-only API，例如 `favicon` 权限和本地 favicon cache 查询。

Firefox 专属行为必须保留稳定的 `browser_specific_settings.gecko.id`，并使用 Firefox 142+ 内置数据同意。用户拒绝 optional technical data 时，核心同步仍然工作。同一个 Gecko id 一旦产出过 AMO 签名版本，Firefox manifest version 不得回退。

## 协议边界

协议契约位于 [`web-activity-protocol.md`](./web-activity-protocol.md)。

Patina Web Sync 只有在确认 Patina 能安全忽略或接收新字段后，才能添加客户端字段。扩展开始依赖新版 Patina 前，Patina 应先能接收旧客户端和新客户端 payload。

普通桌面更新不应引入 Patina 和 Patina Web Sync 同日锁步发布要求。

## 隐私与安全边界

扩展应继续避免 content scripts，除非有明确且经过审视的理由。

扩展不得读取页面正文、表单内容、密码、截图、剪贴板、cookie、下载历史或浏览器历史数据库。

完整 URL 是 Patina 数据导出契约的一部分，因此扩展应保留浏览器提供的 path、query 和 fragment。该数据只发送到本机 Patina；私密窗口必须在读取和发送前跳过，商店声明必须覆盖查询参数可能包含的搜索词或敏感内容。

连接凭据是用户输入的本机 Patina bearer token。扩展只应把它保存在浏览器扩展本地存储中，并且只用于本机 Patina 请求。

网络权限应保持限制在 `http://127.0.0.1/*` 和 `http://localhost/*`，除非产品边界被明确改变。
