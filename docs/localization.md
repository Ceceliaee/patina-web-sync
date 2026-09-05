# 本地化

## 目的

Patina Web Sync 的本地化必须保证：同一条用户可见消息只有一个人工维护源，Chromium 与 Firefox 使用同一语言契约，切换语言只改变显示结果，不改变同步状态、协议数据或持久化事实。

本仓库只实现浏览器扩展需要的轻量语言工程，不复制 Patina 桌面应用的 Rust、ICU4X、XLSX 或复数工具链。

## 支持语言与标识

- 规范 locale 为 `zh-CN`、`en-US` 与 `es`（Español）。
- 默认 locale 为 `zh-CN`，保持现有产品行为。
- 旧 storage 值 `en` 必须迁移为 `en-US`；未知值回落并写回 `zh-CN`。
- WebExtension locale 目录映射为 `zh-CN -> zh_CN`、`en-US -> en`、`es -> es`。
- 新语言必须先加入 schema、registry、review manifest 和自测，再生成目标文件。

## 唯一事实源

人工维护源位于 `locales/`：

- `schema.ts` 定义消息域和类型。
- `registry.ts` 定义支持语言、默认语言和平台 locale 映射。
- `locales/<locale>/ui.ts` 定义 Popup、Options、状态、错误和无障碍文案。
- `locales/<locale>/manifest.ts` 定义扩展名称、描述和商店短描述。
- `review-manifest.ts` 记录规范化内容哈希和真实审核来源。

以下文件是生成产物，不得手工修改：

- `src/chromium/_locales/**`
- `src/firefox/_locales/**`
- `src/chromium/generated/**`
- `src/firefox/generated/**`
- 从 `src/shared/` 复制到两个目标的 Popup、Options、平台适配和状态模型文件

运行 `npm run i18n:generate` 更新生成产物。`npm run check:i18n` 会在临时目录生成并比较；CI 不会静默修复未提交产物。

## 语言与状态边界

- locale 必须是消息解析的显式输入。
- locale 相关缓存必须把 locale 纳入 key；当前实现不需要跨渲染缓存。
- storage、后台脚本和协议 payload 保存稳定状态码、错误码及结构化参数，不保存扩展生成的中文或英文句子。
- 外部服务的任意 `message` 只可作为受限诊断信息，不能驱动控制流，也不能直接覆盖已知错误的本地化文案。
- 语言切换不得修改 token、端口、状态码、错误码、时间戳或 Web Activity payload。

## 用户可见内容边界

以下内容必须进入同一消息契约：

- Popup 与 Options 可见文案。
- 状态、错误、帮助和按钮文案。
- `aria-label`、live region 文案和其他辅助技术名称。
- manifest 名称、描述与商店短描述。
- 默认 locale fallback；fallback 也必须从语言源生成，不能在 HTML 中维护第二份。

以下内容默认不翻译：

- `Patina`、`Patina Web Sync`。
- `Token`、URL、HTTP、JSON、API 等协议或技术标识。
- 状态码、错误码、storage key、manifest field 和 Web Activity payload field。
- 日志中的内部检查标识；面向用户的错误仍必须本地化。

## 状态与错误语义

| 状态码 | 产生条件 | 可重试 | tone | 默认动作 |
| --- | --- | --- | --- | --- |
| `disabled` | Patina 明确返回 `enabled: false` / `web-recording-disabled` | 开启网页同步后可重试 | neutral | 检查 Patina 设置 |
| `configured` | 端口和 Token 已保存，但尚无同步结果 | 是 | neutral | 同步当前页 |
| `connecting` | 本机 bridge 请求进行中 | 等待当前请求 | neutral | 无 |
| `connected` | HTTP 成功且 JSON 明确包含 `ok: true` | 是 | success | 无 |
| `disconnected` | 没有可同步的普通网页 | 切换页面后可重试 | neutral | 打开 http/https 页面 |
| `private` | 当前标签页属于私密/无痕窗口 | 普通窗口可重试 | neutral | 切换到普通窗口 |
| `needs-config` | Token 缺失或配置不完整 | 完成配置后可重试 | danger | 打开 Options |
| `error` | 认证、HTTP、响应格式、服务拒绝或网络失败 | 依错误原因决定 | danger | 查看本地化错误并重试/修正配置 |

| 错误码 | 来源 | 允许参数 | 文案键 |
| --- | --- | --- | --- |
| `none` | 没有错误 | 无 | 无 |
| `missing-token` | storage 中没有 Token | 无 | `error.missingToken` |
| `invalid-token` | HTTP 401/403 或稳定认证错误码 | 无 | `error.invalidToken` |
| `web-recording-disabled` | 经 JSON 验证的 `enabled: false` + 稳定 code；当前 Patina 使用 HTTP 409 | 无 | `error.webRecordingDisabled` |
| `http-error` | 其他非成功 HTTP status | `{ httpStatus }`（100–599） | `error.httpError` |
| `invalid-response` | 2xx 非 JSON、空值、数组、缺少布尔 `ok` | 无 | `error.invalidResponse` |
| `service-rejected` | 2xx `ok: false` 且 code 未知 | 无 | `error.serviceRejected` |
| `request-failed` | fetch/network 异常 | 无 | `error.requestFailed` |
| `unknown-service-error` | 无稳定 code 的旧数据或未知错误 | 无 | `error.unknownService` |

HTTP status、服务端自由文本与 JavaScript exception 不进入错误码。当前实现不持久化 `lastErrorDetail`；如未来确有诊断需要，必须独立限长、排除 Token，且不能直接作为主 UI 文案。

## 消息键与参数

- 消息键按语义命名，例如 `options.saveButton`、`status.connected`、`error.invalidToken`。
- 不使用中文或英文句子作为键。
- 只是当前文本相同但语义不同的内容使用不同键。
- 动态内容使用命名参数；调用点不得拼接本地化前缀。
- 所有 locale 对同一键必须使用相同参数集合。
- 当前没有复数需求；出现真实复数规则前，不提前引入复数 DSL。

## 审核与哈希

`review-manifest.ts` 使用稳定键排序后的规范化消息计算 SHA-256。源或译文变化时，旧哈希必须使检查失败。

已有 `0.2.0` 公开文案可以作为 baseline import，但新增或改变的发布文案仍需记录实际 reviewer。生成器不能自动把内容标记为人工审核完成。执行代理可以记录实现审查，不能冒充维护者人工审校。

日常 `npm run check:i18n` 允许 `status: "pending"`，使实现可以继续验证；正式 tag 工作流额外运行 `npm run check:i18n:release`，所有生产 locale 均须记录 `status: "approved"`、真实 reviewer 和当前内容哈希。未知审核方式不允许发布。

接入前由维护者确认翻译与审核安排。完成文案复核后可记录 `copy-review`；既有 `maintainer-copy-review` 记录继续有效。审核策略由 `scripts/i18n/review-policy.ts` 统一校验，不按语言设置例外。接入决定与验收结果留在对应执行记录；一项决定不自动改变其他语言的贡献安排。不允许删除哈希检查、冒充人工审校或把未复核状态放行。

Options 立即保存语言，Popup 读取已保存语言，不随桌面或浏览器自动切换。浏览器管理页的 manifest 名称和描述由浏览器 locale 机制选择，不能承诺与 Options 选择即时联动。翻译反馈需定位产品、版本、页面及预期含义，修正时同时核对两端术语，不收集私人活动数据或 Token。

## 硬编码规则

- 人工维护的 HTML、JavaScript、TypeScript 和相关文档不得新增用户可见硬编码。
- 精确例外必须记录文件、值或模式、owner 和 reason。
- 不允许以整个目录、整个语言或任意字符串作为宽泛例外。
- 例外对应内容消失后，检查必须因 stale exception 失败。
- 生成目录不作为人工源扫描，但必须与生成器输出字节一致。

## 最低验证

```bash
npm run check:i18n:self-test
npm run check:i18n
npm run check:parity
npm run check
```

本地化改动完成后还要在 Chromium 与 Firefox 中分别验证 `zh-CN`、`en-US` 的 Popup、Options、键盘菜单和动态状态。

## 未来升级条件

出现以下事实后再评估更重的语言工具：

- 真实复数或复杂日期/数字格式需要 CLDR 规则。
- 外部译者和批量审校需要 XLSX/翻译包工作流。
- 新增 RTL locale 需要方向、布局和视觉回归门禁。
- 浏览器 UI 与桌面 UI 需要共享可执行语言包，而不只是共享原则与术语。
