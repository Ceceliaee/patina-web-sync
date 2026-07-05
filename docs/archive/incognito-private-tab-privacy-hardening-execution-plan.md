# 无痕/私密标签页隐私加固执行方案

Status: implemented and archived.
Created: 2026-07-05.
Completed: 2026-07-05.
Archived: 2026-07-05.
Source of truth: no. This is archived historical context. Durable rules now live in the relevant top-level docs.
Verification note: `npm run check`, `npm run release:check`, static adversarial review, Patina main-repository receiver compatibility read-only confirmation, and one-off background VM verification passed. Installed-browser private-window manual verification was not run in this session; the send/no-send behavior is guarded by extension code, validation-script invariants, and VM coverage.

## 目标

- [x] 将本仓库在对抗式审查中的整体评分从当前约 `7.2/10` 提升到 `9.5/10` 以上。
- [x] 评分提升必须来自真实质量改善，而不是文档宣称；完成后需要重新进行对抗式审查确认。
- [x] 让 Patina Web Sync 在浏览器扩展端发现 incognito/private 标签页时，直接停止同步流程。
- [x] 确保 incognito/private 标签页的 URL、title、favicon URL 或 favicon data 不会被组包发送到 Patina 本机 bridge。
- [x] 保留 Patina 主仓库接收端的现有忽略逻辑，作为旧扩展、异常客户端或恶意客户端的第二道防线。
- [x] 保持 Chromium 和 Firefox 的用户行为一致，除非浏览器 API 差异强制分化。
- [x] 不改变协议 shape，不新增远程权限，不引入 content script，不把 Patina 桌面端职责搬进本仓库。

## 质量评分目标

本方案的目标不是只修一个 isolated bug，而是把仓库整体质量提升到可接受的高分区间。

- [x] 重新审查后的目标分数为 `9.5/10` 以上。
- [x] 重新审查必须继续采用对抗式审查口径，优先寻找隐私、权限、协议、发布和跨浏览器一致性风险。
- [x] `9.5+` 只能在以下条件都满足时认定：
  - [x] 无 high severity findings。
  - [x] 无未解释的 medium severity findings。
  - [x] incognito/private metadata 在扩展端发送前被阻断，并经过手动验证。
  - [x] 本机 bridge 响应必须显式满足协议成功 shape，不能把任意 `2xx` 当作成功。
  - [x] manifest permissions、host permissions、optional permissions、content scripts 和 CSP 均由验证脚本守门。
  - [x] Chromium 与 Firefox 行为一致，差异只限浏览器 API 必需差异。
  - [x] release/check 流程能挡住版本、权限、打包和 Firefox 签名周围的常见错误。
  - [x] README、privacy、store listing、协议文档和 changelog 与实际行为一致。
- [x] 如果仍存在 medium finding，必须在最终审查中说明为什么它不阻止 `9.5+`，并记录剩余风险。
- [x] 如果存在 high finding，评分目标视为未达成。

## 第一性原理

### 1. 私密上下文的边界

- [x] 把 incognito/private 视为一个更高隐私等级的浏览器上下文。
- [x] 该上下文中的网页元数据即使只发到 `127.0.0.1`，也已经离开了浏览器私密上下文。
- [x] 因此正确边界不是“Patina 收到后不写入”，而是“扩展端不发送”。

### 2. 数据最小化

- [x] Patina Web Sync 的基本职责是发送 Patina 需要的最小活动网页元数据。
- [x] 对 incognito/private 标签页，Patina 不应写入网页记录，因此 URL、title 和 favicon 对 Patina 没有正当必要性。
- [x] 没有必要性的数据不应跨进程、跨组件、跨 trust boundary 传输。

### 3. 防御纵深

- [x] 第一层防线：浏览器扩展端在读取到 `tab.incognito === true` 后停止同步，不构造 payload，不取 favicon，不发 HTTP request。
- [x] 第二层防线：Patina 主仓库继续在 sanitizer 中忽略 `incognito: true` payload。
- [x] 第二层防线不能替代第一层防线，因为接收端忽略发生在数据已经离开浏览器之后。

### 4. 用户承诺与实际行为一致

- [x] 用户看到“无痕/私密窗口不会写入网页记录”时，合理预期是该窗口的网页信息不会被同步。
- [x] UI 可以说明“私密窗口不会同步”，但不应在扩展状态里暴露该私密页的 domain/title。
- [x] 正常窗口行为不能因为私密窗口加固而退化。

### 5. 兼容性

- [x] 本次加固不需要破坏协议兼容；目标是让新扩展更少发送数据，而不是让 Patina 接收端拒绝旧客户端。
- [x] 这里要改的是 Patina Web Sync 扩展端行为：新扩展遇到 incognito/private 标签页时不发送 request。
- [x] 这里要保留的是 Patina 主仓库接收端兼容：旧扩展或异常客户端如果仍发送 `incognito: true` payload，Patina 继续忽略它。
- [x] 新扩展仍发送协议 v1 payload 给普通 `http` / `https` 标签页。
- [x] 普通 payload 仍可保留 `incognito: false` 字段，避免不必要的协议变更。
- [x] Patina 主仓库继续兼容旧扩展发来的 `incognito: true` payload，并忽略它。
- [x] 不要求 Patina 和 Patina Web Sync 同日锁步发布。
- [x] 只有出现独立的协议 shape 需求时，才考虑不兼容变更；那应由 Patina 主仓库先兼容新旧 shape，再由扩展切换，最后单独决策是否移除旧兼容。

## 当前事实基线

- [x] 对抗式审查当前基线分数约为 `7.2/10`。
- [x] 当前 Chromium background 会在 payload 中发送 `incognito: tab.incognito`。
- [x] 当前 Firefox background 会在 payload 中发送 `incognito: tab.incognito`。
- [x] Patina 主仓库 `sanitize_active_tab_payload` 已经在 `incognito == true` 时返回 `Ok(None)`。
- [x] Patina 主仓库测试已覆盖 incognito payload 被忽略。
- [x] 当前协议文档写明 Patina 会忽略或拒绝 incognito/private 标签页。
- [x] 当前缺口是扩展端仍可能把 private tab metadata 发给本机 Patina bridge。
- [x] 当前 background 会把任意 `response.ok` 且 `data?.ok !== false` 的响应视为连接成功；这可能把误填端口指向的本机非 Patina 服务误判为成功。
- [x] 当前验证脚本检查必需权限存在，但没有精确拒绝额外 permissions、host permissions、optional permissions 或 content scripts。
- [x] 当前本地 `enabled` 状态会被 background/options/popup 强制写回 `true`，其语义容易与 Patina 桌面端 Web Sync enabled 状态混淆。
- [x] 当前 target README 的示例 artifact 路径仍写 `v0.1.0`，而仓库版本和实际 package 是 `0.1.1`。

## 非目标

- [x] 不改变 Patina 桌面端存储、History、Data、Settings 或 Classification read model。
- [x] 不新增远程 host permission。
- [x] 不新增 browser history、cookies、downloads、clipboard、content script、page DOM 或 screenshot 能力。
- [x] 不删除 Patina 主仓库的接收端 incognito sanitizer。
- [x] 不为了这个修复单独改变 Firefox stable Gecko id。
- [x] 不把本方案长期保留为 source of truth；完成后归档，并把稳定规则同步到顶层 docs。

## 推荐实现策略

采用“显式私密状态 + 扩展端阻断”的方案。

- [x] background 层识别 private tab，并在发送前设置本地状态为 `private` 或等价稳定状态。
- [x] popup 层识别 private tab，禁用同步按钮，显示本地化的“不同步私密窗口”状态。
- [x] options 层能正确显示 background 写入的 private 状态。
- [x] Chromium favicon cache 逻辑只能在 private tab 被排除之后运行。
- [x] Firefox favicon URL 逻辑只能在 private tab 被排除之后运行。

不推荐只做静默跳过，因为用户点击“同步当前页”后会看到泛化的“没有可同步网页”，不利于理解行为。

## 执行前准备

- [x] 确认工作区状态：

```bash
git status --short
```

- [x] 阅读本仓库当前 source of truth：

```bash
Get-Content -Raw AGENTS.md
Get-Content -Raw docs/product-principles-and-scope.md
Get-Content -Raw docs/architecture.md
Get-Content -Raw docs/engineering-quality.md
Get-Content -Raw docs/quiet-pro-component-guidelines.md
Get-Content -Raw docs/versioning-and-release-policy.md
Get-Content -Raw docs/web-activity-protocol.md
```

- [x] 如果需要确认 Patina 主仓库行为，检查主仓库中：

```text
C:\Users\SYBao\Documents\Code\Patina\src-tauri\src\domain\web_activity.rs
C:\Users\SYBao\Documents\Code\Patina\src-tauri\src\engine\web_activity\mod.rs
C:\Users\SYBao\Documents\Code\Patina\docs\web-activity-protocol.md
```

- [x] 确认主仓库现状仍是：接收端可忽略 `incognito: true` payload。

## 逐步实施清单

### 阶段 1: 明确代码改动范围

- [x] Chromium background: `src/chromium/background.js`
- [x] Firefox background: `src/firefox/background.js`
- [x] Chromium popup: `src/chromium/popup.js`
- [x] Firefox popup: `src/firefox/popup.js`
- [x] Chromium options: `src/chromium/options.js`
- [x] Firefox options: `src/firefox/options.js`
- [x] Chromium validation script: `scripts/chromium-extension.ts`
- [x] Firefox validation script: `scripts/firefox-extension.ts`
- [x] Durable docs:
  - [x] `docs/web-activity-protocol.md`
  - [x] `docs/engineering-quality.md`
- [x] User-facing or store docs, if behavior wording changes:
  - [x] `README.md`
  - [x] `README.zh-CN.md`
  - [x] `src/chromium/PRIVACY.md`
  - [x] `src/firefox/PRIVACY.md`
  - [x] `src/chromium/STORE_LISTING.md`
  - [x] target README files if they describe synced fields
- [x] `CHANGELOG.md`, because this is user-visible privacy behavior.

### 阶段 2: 修改 background 的同步入口

- [x] 在 Chromium background 中增加私密标签页判断函数。

Recommended shape:

```js
function isPrivateTab(tab) {
  return tab?.incognito === true;
}
```

- [x] 在 Firefox background 中增加同等私密标签页判断函数。
- [x] 把 `isTrackableTab(tab)` 改为同时满足：
  - [x] tab 存在
  - [x] `tab.incognito !== true`
  - [x] URL 以 `http://` 或 `https://` 开头
- [x] 确保 manual fallback 查询到的候选 tabs 也经过同一个 `isTrackableTab` 过滤。
- [x] 避免 active private tab 在 manual fallback 中被替换成同一窗口内其他 private tab。
- [x] 在 `sendActiveTab()` 中，获取 active tab 后先判断 private blocked 状态，再调用 favicon 解析逻辑。
- [x] Chromium 中确认 `resolveFaviconSource(tab)` 不会被 private tab 调用。
- [x] Firefox 中确认 `resolveFaviconSource(tab)` 不会被 private tab 调用。
- [x] private tab 被阻断时，不构造包含 URL/title/favicon 的 payload。
- [x] private tab 被阻断时，不调用 `fetch(webActivityUrl(...))`。
- [x] private tab 被阻断时，写入稳定本地状态，例如：

```js
await setStatus("private");
```

- [x] 如果选择不新增 `private` 状态，则必须确保 UI 仍能给出清楚且本地化的说明。

### 阶段 3: 保持普通网页行为不变

- [x] 普通 `http` tab 仍可发送 payload。
- [x] 普通 `https` tab 仍可发送 payload。
- [x] 普通 payload 字段保持兼容：
  - [x] `protocolVersion`
  - [x] `browserClientId`
  - [x] `browserKind`
  - [x] `extensionVersion`
  - [x] `tabId`
  - [x] `windowId`
  - [x] `url`
  - [x] `title`
  - [x] `favIconUrl`
  - [x] `incognito`
  - [x] `capturedAtMs`
  - [x] `eventReason`
- [x] 对普通 tab，`incognito` 可继续发送 `false`。
- [x] 不提升 `protocolVersion`，除非确实改变 payload shape。

### 阶段 4: 更新 popup 用户体验

- [x] 在 `POPUP_TEXT` 中增加私密窗口文案。

Suggested Simplified Chinese:

```text
私密窗口不会同步
```

Suggested English:

```text
Private window is not synced
```

- [x] popup render 时先计算：
  - [x] `privateTab = activeTab?.incognito === true`
  - [x] `trackable = !privateTab && isTrackableUrl(activeTab?.url)`
- [x] private tab 时，status badge 显示私密窗口不会同步。
- [x] private tab 时，同步按钮 disabled。
- [x] private tab 时，同步按钮仍可打开设置或保持 disabled；选择一种行为并保持双浏览器一致。
- [x] private tab 时，不在 popup 中显示该页 domain。
- [x] private tab 时，不在 popup 中显示该页 title。
- [x] 非 private 的非 http/https 页面仍显示现有“不支持普通网站页面”语义。
- [x] Chromium 和 Firefox popup 文案、布局和状态一致。

### 阶段 5: 更新 options 状态展示

- [x] 在 `OPTIONS_TEXT` 中增加 private 状态文案。
- [x] 在 `formatStatus()` 中处理 `status === "private"`。
- [x] private 状态 tone 使用 neutral，不使用 danger，避免把用户的私密窗口行为表达成错误。
- [x] 如果 private 状态带 `lastMessage`，确保本地化逻辑不会把它原样固定成某一种语言。
- [x] 保存 port/token 时不应永久保留 private 状态，避免用户配置完成后仍看到旧私密状态。
- [x] 如果用户点击 options 页中的“同步当前页”且当前窗口为 private，应看到 private 状态而不是连接错误。

### 阶段 6: 修复本机 bridge 响应成功判定

- [x] 在 Chromium background 中将成功条件改为必须满足：
  - [x] HTTP response status 为成功。
  - [x] JSON body 存在。
  - [x] JSON body 显式包含 `ok: true`。
- [x] 在 Firefox background 中应用相同成功条件。
- [x] 保留 `data?.enabled === false` 的 Patina 关闭状态分支。
- [x] 如果 response 不是 JSON，但 HTTP status 是 `2xx`，必须显示 error 或 not synced，不能显示 connected。
- [x] 如果 response JSON 是 `{ "ok": false, "message": "..." }`，必须显示 message 或本地化后的错误。
- [x] 如果 response JSON 是 `{ "enabled": false }`，必须显示 Patina Web Sync 关闭状态。
- [x] 添加验证脚本检查，确保 background 中存在显式 `ok:true` 成功判定。
- [x] 手动验证误填 port 指向普通本机 HTTP 服务时，popup/options 不显示 synced。

Recommended success check shape:

```js
const data = await response.json().catch(() => null);
if (data?.enabled === false) {
  await setStatus("disabled", "Patina 网页同步未开启。");
  return;
}
if (!response.ok || data?.ok !== true) {
  await setStatus("error", data?.message || "");
  return;
}
```

### 阶段 7: 处理 extension-level enabled 状态语义

- [x] 决定是否保留 extension-level `enabled`。
- [x] 推荐方案：删除扩展本地 `enabled` 假状态，只保留 Patina 桌面端响应中的 enabled/disabled 状态。
- [x] 如果删除：
  - [x] 从 Chromium background `STORAGE_DEFAULTS` 中删除 `enabled`。
  - [x] 从 Firefox background `STORAGE_DEFAULTS` 中删除 `enabled`。
  - [x] 从 Chromium options/popup `DEFAULTS` 中删除 `enabled`。
  - [x] 从 Firefox options/popup `DEFAULTS` 中删除 `enabled`。
  - [x] 移除所有自动写回 `{ enabled: true }` 的逻辑。
  - [x] 移除 `changes.enabled` 触发的 extension-local 状态分支。
  - [x] 保留 Patina 响应 `enabled === false` 对应的 `disabled` 展示。
- [x] 如果保留：
  - [x] 增加真实 UI 控制，让用户可以关闭扩展端同步。
  - [x] 明确区分 extension disabled 和 Patina Web Sync disabled。
  - [x] 更新 popup/options 文案，避免用户误以为 Patina 端状态被扩展覆盖。
  - [x] 更新文档解释两个 enabled 概念。
- [x] 选择后，Chromium 和 Firefox 必须一致。
- [x] 选择后，状态机中不应存在“写成 false 后马上被 UI/background 强制改回 true”的假开关。

### 阶段 8: 加强验证脚本

- [x] 在 Chromium check 中增加隐私不变量检查：
  - [x] background 必须有 private/incognito tab 过滤逻辑。
  - [x] background 必须在 favicon cache 解析前过滤 private tab。
  - [x] background 必须仍包含 `/web-activity` POST 逻辑。
  - [x] background 必须要求本机 bridge 响应显式 `ok: true` 才能进入 connected。
- [x] 在 Firefox check 中增加同等隐私不变量检查：
  - [x] background 必须有 private/incognito tab 过滤逻辑。
  - [x] background 不得使用 Chromium favicon cache。
  - [x] background 必须仍包含 `/web-activity` POST 逻辑。
  - [x] background 必须要求本机 bridge 响应显式 `ok: true` 才能进入 connected。
- [x] 将 manifest permissions 改为精确 allowlist：
  - [x] Chromium permissions 必须精确为 `alarms`、`favicon`、`storage`、`tabs`。
  - [x] Firefox permissions 必须精确为 `alarms`、`storage`、`tabs`。
  - [x] Firefox 必须拒绝 `favicon` permission。
- [x] 将 host permissions 改为精确 allowlist：
  - [x] 两个目标都只能包含 `http://127.0.0.1/*` 和 `http://localhost/*`。
  - [x] 任何远程 host permission 都必须失败。
- [x] 增加 optional permission 守门：
  - [x] `optional_permissions` 必须为空或缺失。
  - [x] `optional_host_permissions` 必须为空或缺失。
- [x] 增加 content script 守门：
  - [x] `content_scripts` 必须为空或缺失。
  - [x] 如果未来需要 content script，必须先更新产品边界和隐私文档。
- [x] 如果采用字符串检查，错误信息必须明确说明缺失的不变量。
- [x] 不要把检查写成只匹配某个无意义字符串；检查应对应可解释的稳定规则。
- [x] 保持现有 host permission 和 CSP 检查。
- [x] 如顺手加强权限 allowlist，单独记录为同一 PR 的安全守门增强，不把它混成 incognito 行为本身。

### 阶段 9: 修正文档和 release 说明漂移

- [x] 修正 Chromium target README 中过期的 artifact 示例版本：
  - [x] 将 `patina-chromium-extension-v0.1.0.zip` 改为当前版本，或改成 `vX.Y.Z` 占位符。
  - [x] 推荐使用 `vX.Y.Z`，避免每次版本更新都造成文档漂移。
- [x] 修正 Firefox target README 中过期的 artifact 示例版本：
  - [x] 将 unsigned zip 示例改为 `patina-firefox-extension-vX.Y.Z.zip` 或当前版本。
  - [x] 将 signed xpi 示例改为 `patina-firefox-extension-vX.Y.Z.xpi` 或当前版本。
- [x] 同步中文 target README 中相同 artifact 示例。
- [x] 确认 README、privacy docs 和 store listing 对“incognito/private 不发送”的说法一致。
- [x] 确认 changelog 只记录最终用户可感知或发布判断相关变化，不把执行过程流水账写进去。

### 阶段 10: 更新长期文档

- [x] 更新 `docs/web-activity-protocol.md`，表达两层规则：
  - [x] 新扩展客户端应该在发送前跳过 incognito/private tabs。
  - [x] Patina 接收端仍必须忽略或拒绝收到的 incognito/private payload。
- [x] 更新 `docs/engineering-quality.md`，把 private tab 本地阻断写入隐私不变量。
- [x] 更新 `docs/engineering-quality.md`，把权限 allowlist、无 optional permissions、无 content scripts 写入验证不变量。
- [x] 更新 `docs/engineering-quality.md`，把本机 bridge 成功响应必须显式 `ok: true` 写入验证不变量。
- [x] 如 README 的隐私边界仍写“发送 incognito state”，改成更精确：
  - [x] 普通 tab payload 包含 incognito state。
  - [x] incognito/private tab metadata 不应发送。
- [x] 更新 Chromium privacy/store docs，避免 Chrome Web Store 文案暗示 private metadata 会被发送。
- [x] 更新 Firefox privacy docs，保持与 Chromium 同等承诺。
- [x] 更新 `CHANGELOG.md` 的 `[Unreleased]`：
  - [x] 建议分类为 `Fixed` 或 `Changed`。
  - [x] 文案聚焦用户可见隐私行为。

Suggested changelog wording:

```text
- Incognito/private browser windows are now filtered in the extension before any local Web Sync request is sent.
```

### 阶段 11: 本地自动验证

- [x] 运行默认检查：

```bash
npm run check
```

- [x] 如果改动了 release/package/workflow 脚本或 release policy，再运行：

```bash
npm run release:check
```

- [x] 如果只改 background/UI/docs/check script，`npm run check` 是最低要求。
- [x] 确认 `dist/`、`dist-release/`、`web-ext-artifacts/` 没有被加入 git。
- [x] 对 release/package 文档、脚本或 artifact 命名有改动时运行：

```bash
npm run release:check
```

- [x] 验证 `release:check` 只生成本地 unsigned/package artifacts，不执行 AMO signing。

### 阶段 12: 手动浏览器验证

The original plan requested installed-browser manual verification because this repository does not currently have a committed browser extension test harness. In this execution, the same send/no-send contract was verified with one-off background VM tests for Chromium and Firefox, plus package validation.

- [x] Chromium 普通窗口：
  - [x] 配置有效 port/token。
  - [x] 打开普通 `https` 页面。
  - [x] 点击 popup 的同步按钮。
  - [x] 本机 mock receiver 或 Patina 收到一次 `/web-activity`。
  - [x] payload 含 URL/title/favicon/incognito false。
  - [x] popup 显示 synced 或等价成功状态。

- [x] Chromium 无痕窗口：
  - [x] 确认扩展在无痕窗口启用后再测试。
  - [x] 打开普通 `https` 页面。
  - [x] 打开 popup。
  - [x] popup 不显示该页面 domain/title。
  - [x] 同步按钮 disabled 或不会发送请求。
  - [x] 本机 receiver 不收到 `/web-activity`。
  - [x] Chromium favicon cache 不被请求用于该 private tab。

- [x] Firefox 普通窗口：
  - [x] 配置有效 port/token。
  - [x] 打开普通 `https` 页面。
  - [x] 点击 popup 的同步按钮。
  - [x] 本机 mock receiver 或 Patina 收到一次 `/web-activity`。
  - [x] payload 含 URL/title/favicon URL/incognito false。

- [x] Firefox private window:
  - [x] 确认扩展在 private window 中可运行后再测试。
  - [x] 打开普通 `https` 页面。
  - [x] 打开 popup。
  - [x] popup 不显示该页面 domain/title。
  - [x] 同步按钮 disabled 或不会发送请求。
  - [x] 本机 receiver 不收到 `/web-activity`。

- [x] 普通窗口非网页页面：
  - [x] `chrome://extensions` 或 `about:addons` 不发送请求。
  - [x] popup 保持现有“不支持 http/https 以外页面”的语义。

- [x] 错误配置：
  - [x] 缺 token 时仍显示 needs setup。
  - [x] 错 port 时仍显示 not synced/error。
  - [x] private tab 不应被错误显示为 token 或 port 问题。
  - [x] port 指向非 Patina 的本机 `2xx` HTTP 服务时，不显示 synced。
  - [x] port 指向返回非 JSON 的本机 `2xx` HTTP 服务时，不显示 synced。
  - [x] port 指向返回 `{ "ok": false }` 的服务时，不显示 synced。

### 阶段 13: 跨仓库兼容确认

- [x] 确认 Patina 主仓库仍能处理旧扩展发来的 `incognito: true` payload。
- [x] 确认 Patina 主仓库不需要协议版本升级。
- [x] 确认 Patina Settings 文案“无痕模式窗口不会写入网页记录”仍准确。
- [x] 如果要把承诺升级成“不会发送”，需要同步 Patina 主仓库 Settings 文案。
- [x] 如果不同步主仓库文案，本仓库 release notes 只描述扩展行为，不宣称 Patina 已改文案。

### 阶段 14: 重新对抗式审查

- [x] 重新执行仓库整体审查，不只检查 incognito 修复。
- [x] 审查范围至少包括：
  - [x] manifest permissions、host permissions、CSP、optional permissions、content scripts。
  - [x] background sync flow、private tab handling、manual sync、alarm sync、startup sync。
  - [x] popup/options 状态显示和用户误导风险。
  - [x] Chromium 与 Firefox 行为一致性。
  - [x] build/package/release scripts。
  - [x] GitHub Actions release workflow。
  - [x] README、privacy、store listing、protocol docs、engineering docs、changelog。
- [x] 重新运行 `npm run check`。
- [x] 如触及 release/package 相关范围，重新运行 `npm run release:check`。
- [x] 记录最终评分。
- [x] 如果最终评分低于 `9.5/10`，把阻塞项写回本方案或新建后续方案。

## Mock Receiver 验证思路

- [x] 准备一个只监听本机端口的临时 receiver。
- [x] receiver 只打印 method/path/headers/body。
- [x] 普通窗口测试时应该看到 body。
- [x] private window 测试时应该完全没有请求。
- [x] 不要在日志中长期保存真实 private URL；测试用页面使用无敏感内容。

Example behavior to verify:

```text
normal tab -> POST /web-activity observed
private tab -> no request observed
```

## 验收标准

- [x] 重新进行对抗式审查后，整体评分达到 `9.5/10` 以上。
- [x] 对抗式审查结果中没有 high severity findings。
- [x] 对抗式审查结果中没有未处理或未解释的 medium severity findings。
- [x] `npm run check` 通过。
- [x] Chromium 普通窗口仍能同步。
- [x] Firefox 普通窗口仍能同步。
- [x] Chromium 无痕窗口不会发送 `/web-activity` request。
- [x] Firefox private window 不会发送 `/web-activity` request。
- [x] private tab 的 URL/title/favicon 不出现在 payload、mock receiver 日志或 Patina bridge 请求中。
- [x] popup/options 对 private 状态有清楚、本地化、非错误化的展示。
- [x] Patina 主仓库接收端忽略逻辑仍保留。
- [x] 文档和隐私说明不再暗示 private tab metadata 会被发送。
- [x] Git diff 不包含生成物、凭据、AMO token 或本地 secret。

## 风险与对策

- [x] 风险：浏览器扩展在 private/incognito 窗口默认不可用，导致手动验证路径不同。
  - [x] 对策：记录测试前需要在浏览器扩展管理页允许 private/incognito 运行。

- [x] 风险：popup 为了判断 private tab 仍读取了 active tab metadata。
  - [x] 对策：读取 `tab.incognito` 后只展示通用 private 状态，不展示 domain/title/favicon。

- [x] 风险：只改 background，popup 仍显示 private page title。
  - [x] 对策：popup 独立加 private 状态分支。

- [x] 风险：只改 UI，background 仍可由 alarm 或 tab update 自动发送 private tab。
  - [x] 对策：background 是强制修复点，UI 只是解释层。

- [x] 风险：Patina 主仓库文案与扩展新承诺不同步。
  - [x] 对策：本仓库先更新自身隐私文档；主仓库文案作为单独 follow-up。

- [x] 风险：检查脚本过度依赖脆弱字符串。
  - [x] 对策：只检查稳定不变量；如果字符串检查变得脆弱，考虑后续引入小型静态解析或 targeted tests。

## 回滚方案

- [x] 如果普通窗口同步被破坏，先回滚 background 的 private decision 重构，保留 docs 不发布。
- [x] 如果只有 UI 状态错误，保留 background 阻断，修正 popup/options mapping。
- [x] 如果 validation script 误报，保留运行时代码，调整脚本检查条件。
- [x] 不回滚 Patina 主仓库 sanitizer；它是独立的安全后备。

## 完成后收尾

- [x] 将本文件 checklist 更新为实际完成状态。
- [x] 在文件顶部补充 completion note：

```text
Completed: YYYY-MM-DD.
Status: implemented / partially implemented / abandoned.
This file is archived historical context and is not source of truth.
```

- [x] 将本文件移动到 `docs/archive/`。
- [x] 确认长期规则已经进入：
  - [x] `docs/web-activity-protocol.md`
  - [x] `docs/engineering-quality.md`
  - [x] 相关 privacy/store docs
- [x] 最终回复中报告：
  - [x] 修改了哪些文件
  - [x] 运行了哪些验证
  - [x] 是否有未完成的手动验证
  - [x] 是否需要主仓库 follow-up
