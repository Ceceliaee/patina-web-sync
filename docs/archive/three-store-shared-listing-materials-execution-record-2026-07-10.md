# 三大商店共用上架资料最终执行记录

本记录对应 [`three-store-shared-listing-materials-execution-plan-2026-07-10.md`](./three-store-shared-listing-materials-execution-plan-2026-07-10.md)。

## 1. 执行记录模板

每次集中执行后追加一条：

```text
日期：
执行人：
候选版本：
Git commit / working tree：
完成阶段：
关键决策：
npm run check：通过 / 失败 / 未运行
npm run release:check：通过 / 失败 / 未运行
Chromium package SHA-256：
Firefox package SHA-256：
官方规则复核日期：
剩余阻塞：
下一步：
```

## 2. 完成与归档

- [x] 执行方案第 4 节全部成功标准已勾选。
- [x] 执行方案第 20 节共用资料结论为 GO。
- [x] 三个平台结论均有证据，即使其中某个平台仍为 NO-GO。
- [x] Git diff 只包含本任务和之前已确认的相关素材改动。
- [x] 没有生成物、secret 或个人资料进入版本控制。
- [x] 将本方案从 `docs/working/` 移到 `docs/archive/`。
- [x] 在 GitHub Project 中把“准备扩展商店共用上架资料”移到 Done。
- [x] 解除三个实际发布任务中由共用资料造成的阻塞。
- [x] 不自动关闭、删除或发布任何外部事项。

## 3. 最终执行记录

> 归档副本中的 `[x]` 表示该检查项已经执行、已形成明确结论，或条件分支已被判定为 N/A；不表示互斥方案被同时实现。

### 3.1 执行摘要

| 项目 | 最终结果 |
| --- | --- |
| 执行日期 | 2026-07-10 |
| 候选版本 | `0.2.0` |
| 运行时数据契约 | 完整 URL（含 path、query、fragment）发送到本机 Patina 供导出；tab/window ID、采集时间和事件原因不再发送 |
| Firefox 数据同意 | required：`authenticationInfo`、`browsingActivity`、`searchTerms`、`websiteContent`；optional：`technicalAndInteraction` |
| Firefox 最低版本 | `142.0`；桌面 140 已支持内置同意，但 142 同时消除 AMO Android compatibility warning，且不声明 Android target |
| manifest 本地化 | Chromium 与 Firefox 均包含 `default_locale: en`、`_locales/en` 和 `_locales/zh_CN` |
| 共用资料 | `STORE_LISTING.md`、`PRIVACY.md`、审核说明和提交参考已与代码对齐 |
| 素材策略 | Chrome / Firefox 各选择一张干净 options 截图；Edge 首发省略可选截图；未选素材移入 `store-assets/source/unselected/` |
| 打包修复 | Chromium / Firefox zip 根目录直接包含 `manifest.json`，不再多包一层版本目录 |
| AMO 外部版本事实 | Developer Hub 于 2026-07-10 显示最新已批准版本为 `0.1.1`，因此 `0.2.0` 尚未占用 |
| Chrome / Edge 外部状态 | 开发者账号已就绪；控制台会话要求重新登录。当前任务历史只完成账号注册，未创建或上传 `0.2.0` 扩展草稿；真实上传前仍须再次核对版本门 |
| 外部发布 | 未上传、未提交审核、未发布；符合本任务范围 |

### 3.2 验证证据

- `npm run check`：通过。
- `npm run release:check`：通过，未执行 AMO signing。
- Firefox `web-ext lint --warnings-as-errors`：0 errors、0 notices、0 warnings。
- `scripts/check-runtime-privacy.ts` 覆盖：
  - 含 `?q=export-me#full-url` 的 URL 原样发送完整地址，供本机 Patina 导出。
  - Chromium 正常 payload、private 跳过、internal page 跳过。
  - Firefox optional technical consent 允许与拒绝两条路径。
  - Firefox private 标签页即使技术数据已授权也不发送。
- 本机 Firefox 可执行版本：`152.0.5`。
- 隔离 Firefox 临时 profile 已成功启动到“附加组件管理器”窗口并在测试后清理；Windows 浏览器画面检查因当前安全策略中止，未采用键鼠或其他界面绕过。该限制由 AMO validator、manifest 精确检查和运行时双分支测试补充覆盖。
- 图片尺寸和数量：`npm run check:store-assets` 通过。
- 包内容：两个 zip 都有 11 个 allowlist 文件、根级 `manifest.json`、两个 locale message 文件，且无 `.secrets`、`node_modules` 或嵌套 `dist`。

### 3.3 候选包

| 平台 | 本地文件 | 字节数 | SHA-256 |
| --- | --- | ---: | --- |
| Chromium / Chrome / Edge | `dist/extensions/chromium/patina-chromium-extension-v0.2.0.zip` | 59,691 | `EBD361E597D893C336838DF8D5E995FD4428FE3758B2F65A45BAB20054F227C5` |
| Firefox AMO（未签名开发包） | `dist/extensions/firefox/patina-firefox-extension-v0.2.0.zip` | 58,431 | `D935B77D6AA2FA9599A0DEA7AC44336DA29EDBF7B23F25C6F4757F2A4AC53038` |

### 3.4 最终 Go / No-Go

- 共用资料：**GO**。
- Chrome Web Store 材料交接：**GO**；真实上传前重新登录并复核同版本草稿。
- Firefox AMO 材料交接：**GO**；已确认最高外部版本 `0.1.1`，使用 listed `On this site` 流程，不运行 unlisted signing helper。
- Microsoft Edge Add-ons 材料交接：**GO**；真实上传前重新登录并确认 availability / markets。
- 三个商城实际提交与发布：**不在本任务中执行**，不构成本次共用资料归档的阻塞。

### 3.5 后续独立任务入口

后续三个“发布到商城”任务直接使用：

- `STORE_LISTING.md`：中英文 copy、权限理由、数据分类、平台字段和素材路径。
- `PRIVACY.md`：共用公开隐私政策。
- `docs/store-reviewer-test-instructions.md`：审核员无账号测试路径。
- `docs/store-submission.md`：版本门、提交策略和平台差异。
- `store-assets/<store>/`：实际上传素材。
- `dist/extensions/<target>/`：本地候选包；上传前重新运行 `npm run release:check` 并复核 hash。

## 4. 归档后完整 URL 契约纠正（2026-07-11）

- [x] 用户根据 Patina 数据导出的“URL 地址”字段指出 origin 裁剪会破坏完整 URL 导出。
- [x] 确认 Patina CSV、SQLite、Parquet 导出器和数据库 schema 均已支持 `url`，问题位于扩展 payload 与 Patina sanitizer。
- [x] Chromium 与 Firefox 恢复发送浏览器提供的完整 `http` / `https` URL，包括 path、query 和 fragment。
- [x] Patina sanitizer 恢复把完整 URL 写入 `web_activity_segments.url`，同时继续提取域名用于分类。
- [x] Firefox required 数据类别加入 `searchTerms`；Chrome、Edge、AMO 文案和隐私政策同步披露查询参数风险。
- [x] 私密窗口发送前过滤、仅本机目标、bearer token、无正文读取和 optional technical consent 保持不变。
- [x] 扩展 `npm run release:check` 通过；AMO lint 为 0 errors、0 notices、0 warnings。
- [x] Patina sanitizer、CSV 完整 URL 导出、316 项 Rust tests、clippy、91 项前端生命周期测试、15 项 replay tests 和生产构建均通过。
- [x] 第 3.3 节候选包字节数与 SHA-256 已更新，旧 origin-only 包不再作为候选。
