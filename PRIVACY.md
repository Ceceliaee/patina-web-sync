# Patina Web Sync Privacy Policy

Last updated: July 11, 2026

English is the primary policy text. The Simplified Chinese section below is an equivalent convenience translation.

## English

### Purpose and Local-Only Boundary

Patina Web Sync is a browser extension companion for the free Patina Windows desktop app. Its single purpose is to add the current non-private active website context to local Patina time records.

Patina Web Sync does not provide an account, cloud sync, advertising, analytics, or a remote collection service. Its sync requests are limited by the extension manifest to Patina on the same computer at `127.0.0.1` or `localhost`.

### Data Processed

For a regular active `http` or `https` tab, the extension may process:

- The complete page URL, such as `https://example.com/search?q=keyword#result`, including its path, query string, and URL fragment. Query strings may contain search terms or other information entered into a website.
- The page title.
- Website icon information. Chromium-family builds may read the browser's local favicon cache; Firefox uses icon metadata exposed for the active tab.
- An `incognito: false` marker for protocol compatibility.
- A generated browser client identifier, browser kind, and extension version. Chromium-family builds send these local technical fields to Patina. Firefox sends them only if the user grants the optional `technicalAndInteraction` data permission.

The extension does not transmit tab ID, window ID, capture timestamp, or sync event reason.

The extension also handles local configuration and state:

- Patina local port.
- Patina bearer token.
- Generated browser client identifier.
- Language preference.
- Recent connection and sync status.

### Automatic and Manual Triggers

After Web Sync is configured, synchronization can run automatically when the browser or extension starts, the active tab changes, the active page changes, a browser window regains focus, a local setting changes, or a lightweight periodic refresh runs. The user can also select the manual “Sync current page” action.

Every trigger follows the same destination and private-browsing checks. Automatic synchronization does not expand the data fields described in this policy.

### Local Authentication and Transfer

The port and bearer token are entered by the user from Patina Settings and stored in browser extension local storage. The port selects the local Patina endpoint. The bearer token is placed only in the `Authorization` header of a request to the user's local Patina app.

For a synced page, the extension sends one JSON payload to `http://127.0.0.1:<port>/web-activity` or the equivalent `localhost` address. This is a transfer from the browser to another application on the same computer; it is not described as “no transfer.” The developer, cloud services, and third-party servers do not receive the synced webpage data.

### Storage and Retention

The extension stores the port, token, generated client identifier, language preference, and recent sync status in browser extension local storage. Those settings remain until the user clears them or uninstalls the extension.

Website activity records, including the complete URL, are stored separately by the Patina desktop app on the user's computer. Patina uses the full URL for the optional `url` / “URL 地址” data-export field and derives domain fields for classification and statistics. Retention, editing, deletion, backup, and restore of those records are controlled by Patina and the user. Uninstalling the extension removes extension storage but does not automatically delete existing Patina records. Disabling Web Sync stops new extension records from being accepted.

### Private Browsing and Unsupported Pages

Incognito, private, and InPrivate tabs are detected and skipped before website icon resolution or payload construction. Their complete URL, title, icon, and sync payload are not sent to Patina. Browser internal pages, extension pages, and other non-`http`/`https` pages are also skipped.

Patina retains receiver-side private-payload rejection as a compatibility safeguard for older or abnormal local clients. It is not a substitute for the extension's pre-send filtering.

### Data the Extension Does Not Read

Patina Web Sync does not read or collect page body or DOM content, form values, passwords, cookies, screenshots, clipboard contents, download history, or the browser history database.

### Browser Differences and Firefox Consent

Chromium-family builds request the `favicon` permission to read the browser's local favicon cache. Firefox does not request that Chromium-only permission.

Firefox 142 or later uses Firefox's built-in data consent declaration. `authenticationInfo`, `browsingActivity`, `searchTerms`, and `websiteContent` are required for the local sync and full-URL export purpose. `searchTerms` is declared because a complete URL query may contain a search term. `technicalAndInteraction` is optional. If the user declines or removes that optional permission, Firefox continues the core sync without the browser client identifier, browser kind, or extension version.

### Sharing, Sale, and Secondary Use

Patina Web Sync does not sell user data. It does not use synced webpage data for advertising, analytics, profiling, credit decisions, or cross-site tracking. It does not share synced webpage data with the developer or third parties.

### User Controls

Users can stop new synchronization by disabling Web Sync in Patina, clearing the port or token in the extension, disabling the extension, or uninstalling it. Users can clear extension-local configuration through browser extension storage controls or by reinstalling the extension. Patina controls are used to manage records already stored by Patina.

### Changes and Contact

This policy may be updated when the extension changes its data handling. The updated policy and source will be published in this repository.

For privacy questions or support, use the Patina Web Sync issue tracker:

https://github.com/Ceceliaee/patina-web-sync/issues

## 简体中文

### 用途与本机边界

Patina Web Sync 是免费 Patina Windows 桌面应用的浏览器伴生扩展。它的单一用途是把当前非私密活动网站的上下文补充到 Patina 本机时间记录中。

Patina Web Sync 不提供账号、云同步、广告、分析或远程采集服务。扩展 manifest 把同步请求限制在同一台电脑上的 `127.0.0.1` 或 `localhost` Patina。

### 处理的数据

对于当前普通 `http` 或 `https` 活动标签页，扩展可能处理：

- 完整页面 URL，例如 `https://example.com/search?q=keyword#result`，包括路径、查询字符串和 URL 片段。查询字符串可能包含搜索词或用户输入网站的其他信息。
- 页面标题。
- 网站图标信息。Chromium 系版本可能读取浏览器本地 favicon 缓存；Firefox 使用活动标签页提供的图标元数据。
- 用于协议兼容的 `incognito: false` 标记。
- 扩展生成的浏览器客户端标识、浏览器类型和扩展版本。Chromium 系版本会把这些本机技术字段发给 Patina；Firefox 只有在用户允许可选的 `technicalAndInteraction` 数据权限后才发送。

扩展不会发送标签页 ID、窗口 ID、采集时间或同步事件原因。

扩展还会处理以下本机配置和状态：Patina 本机端口、Patina bearer Token、扩展生成的浏览器客户端标识、语言偏好以及最近连接和同步状态。

### 自动与手动触发

配置 Web Sync 后，浏览器或扩展启动、活动标签页切换、活动页面变化、浏览器窗口重新获得焦点、本机设置变化或轻量定时刷新时，扩展可能自动同步。用户也可以手动选择“同步当前页”。所有触发方式都使用相同的目标限制和私密窗口检查，不会增加本政策之外的数据字段。

### 本机鉴权与传输

用户从 Patina Settings 取得端口和 bearer Token，并将其保存在浏览器扩展本地 storage。端口用于选择本机 Patina endpoint；Token 只会放入发往用户本机 Patina 请求的 `Authorization` header。

同步普通网页时，扩展会向 `http://127.0.0.1:<port>/web-activity` 或等价的 `localhost` 地址发送一个 JSON payload。这是从浏览器向同一台电脑上另一应用的传输，因此不会被表述为“没有传输”。开发者、云服务和第三方服务器不会收到同步的网页数据。

### 存储与保留

端口、Token、生成的客户端标识、语言偏好和最近同步状态保存在浏览器扩展本地 storage，直到用户清除或卸载扩展。

网页活动记录（包括完整 URL）由 Patina 桌面应用另行保存在用户电脑上。Patina 将完整 URL 用于可选的 `url` /“URL 地址”数据导出字段，并从中提取域名用于分类和统计。记录的保留、编辑、删除、备份与恢复由 Patina 和用户控制。卸载扩展会清除扩展 storage，但不会自动删除 Patina 中已有的记录；在 Patina 中关闭 Web Sync 会阻止接收新的扩展记录。

### 私密窗口和不支持页面

扩展会在读取网站图标或构造 payload 之前识别并跳过无痕、私密和 InPrivate 标签页，不会向 Patina 发送其完整 URL、标题、图标或同步 payload。浏览器内部页面、扩展页面和其他非 `http`/`https` 页面也会被跳过。

Patina 接收端继续保留拒绝私密 payload 的兼容保护，用于应对旧客户端或异常本机客户端；它不替代扩展发送前的过滤。

### 扩展不会读取的数据

Patina Web Sync 不会读取或收集页面正文或 DOM 内容、表单值、密码、Cookie、截图、剪贴板内容、下载历史或浏览器历史数据库。

### 浏览器差异与 Firefox 同意

Chromium 系版本请求 `favicon` 权限，用于读取浏览器本地 favicon 缓存。Firefox 不请求这一 Chromium 专属权限。

Firefox 142 及以上版本使用 Firefox 内置的数据同意声明。`authenticationInfo`、`browsingActivity`、`searchTerms` 和 `websiteContent` 是本机同步与完整 URL 导出用途所需的数据类型；声明 `searchTerms` 是因为完整 URL 的查询参数可能包含搜索词。`technicalAndInteraction` 为可选。如果用户拒绝或撤销该可选权限，Firefox 仍会继续核心同步，但不会发送浏览器客户端标识、浏览器类型或扩展版本。

### 分享、出售与二次使用

Patina Web Sync 不出售用户数据，不把同步的网页数据用于广告、分析、画像、信贷决策或跨站跟踪，也不会把这些数据分享给开发者或第三方。

### 用户控制

用户可以在 Patina 中关闭 Web Sync、清除扩展中的端口或 Token、停用扩展或卸载扩展，从而停止新的同步。用户可以通过浏览器扩展 storage 控制或重新安装清除扩展本地配置；已经由 Patina 保存的记录需通过 Patina 控制管理。

### 变更与联系

当扩展的数据处理方式变化时，本政策可能更新。更新后的政策和源码会发布在本仓库。

隐私问题或支持请求请使用 Patina Web Sync Issues：

https://github.com/Ceceliaee/patina-web-sync/issues
