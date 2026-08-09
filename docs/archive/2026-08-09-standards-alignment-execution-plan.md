# Patina Web Sync 规范对齐执行方案

> 文档类型：How-to 执行指南
>
> 目标仓库：`Patina-Web-Sync`
>
> 创建日期：2026-08-09
>
> 当前状态：仓库内实现与对抗式审查完成；正式发布门待维护者审校与独立授权
>
> 当前基线：`main` / `ad956ab` / `v0.2.0`
>
> 建议交付版本：`0.2.1`，最终版本仍须在执行阶段通过外部版本占用检查确认

## 归档结论（2026-08-09）

仓库内实现已经完成并通过最终回归，候选版本确定为 `0.2.1`。正式发布链会在维护者完成中英文 copy review 之前由 `npm run check:i18n:release` 主动阻断；本任务未获 commit、push、tag、GitHub Release、AMO 签名或任何商店上传授权，因此这些动作保持未执行。

对抗式审查发现并修复了五类初轮自动检查未能证明的问题：旧版本检查仍硬编码 Node 20/npm 8；Release 预检前会修改 metadata 且未拒绝计划外资产/回读 attestation；长期商店指南仍残留固定候选版本；英文长错误在窄视口撑破 Options 卡片；Patina 主应用真实的 HTTP 409 disabled 响应被误分类为通用 HTTP 错误。对应防回归检查均已加入长期命令链。

最终证据摘要：

- 固定工具链：Node `24.18.0`、npm `11.16.0`、`@types/node@24.13.3`。
- 最终命令：`npm ci`、连续两次 `npm run i18n:generate`、`npm run release:check -- 0.2.1`、`npm audit --omit=dev --audit-level=high` 全部通过。
- 真实浏览器：Chromium `147.0.7727.15` 完成两个目标源的中英文 Options/Popup、键盘焦点、400px reflow 和 dark mode 验收；Firefox `152.0.5` 通过 `web-ext` 临时 profile 安装/启动 smoke test。
- 双仓协议 SHA-256：`F480AB968BD5BB7B6DF69334C710AFC7AEDCAC73C6E51B1590C2473002E101B3`，两仓字节一致，并明确 disabled 使用 HTTP `409`。
- Chromium `0.2.1` ZIP SHA-256：`31BF0C64EAB3AEE56F855F12BA2638CE9A448A3E3C89804BEE5DD00786487BB2`。
- Firefox `0.2.1` 未签名上传 ZIP SHA-256：`8B8183C97D8F3B7246F0614BD8BEDB4772E1FB20C084DD1D0D22FD9BEACA4D39`；正式 XPI 必须在 AMO public/listed 后由工作流下载。
- 运行时依赖 audit 为 `0`；完整 audit 剩余 3 个 high 均来自最新 `web-ext@10.6.0 -> addons-linter@10.10.0 -> image-size@2.0.2` 的开发期上游链，边界与升级触发条件已写入长期工程质量规范。
- 未完成且不得伪报：维护者双语 copy approval、Edge 本机安装 smoke、Firefox consent UI 人工矩阵、与真实 Patina 进程的端到端写入/导出、commit/push/tag/Release/商店操作。

## 1. 文档目的

本文档用于把 Patina 主仓库在 2026 年 8 月前后形成的长期规范，按扩展仓库的实际技术边界落到可执行任务中。目标不是机械复制主应用的整套实现，而是让 Patina Web Sync 具备同等强度的长期约束：用户可见语言有唯一事实源，持久化状态与语言解耦，Chromium 与 Firefox 的共同能力不会漂移，测试覆盖真实失败边界，发布资产可复现且不可静默替换，长期文档不会混入过期的版本状态。

本文档同时是执行清单和验收索引。任何任务只有在“改动已完成、验证已通过、证据已记录”三者同时成立时才能勾选。

## 2. 使用规则

- [x] 开始执行前，确认工作树干净，或者完整记录并避开已有用户改动。
- [x] 每次只把一个阶段标记为“执行中”；未满足上一阶段退出条件时，不进入依赖它的下一阶段。
- [x] 不预先勾选任何实现、测试、提交、推送、标签、发布或商店操作。
- [x] 每个勾选项都应在本文件对应的“执行证据”处留下提交、命令输出、哈希或人工检查记录。
- [x] 自动化检查通过不替代人工交互和商店外部事实检查。
- [x] `commit`、`push`、`tag`、GitHub Release、AMO 签名和商店提交是不同授权边界；执行本文档不自动授权其中任何远端操作。
- [x] 若长期规则在执行中发生变化，先更新对应的顶层长期文档，再调整本文档；不得让一次性计划反向成为长期事实源。
- [x] 全部仓库内任务结束后，将本文件移入 `docs/archive/`，并在文件顶部写明完成结论、最终提交和未执行的外部动作。

## 3. 范围

### 3.1 纳入范围

- 本地化规范和轻量本地化基础设施。
- Popup、Options、后台状态、扩展 manifest 与商店短描述中的用户可见语言。
- Chromium 与 Firefox 的共同源、适配边界和一致性门禁。
- 语言菜单、动态状态和键盘操作的无障碍行为。
- Node、npm、类型定义、本地脚本和 CI 的工具链契约。
- 运行时隐私、服务端错误和异常响应测试。
- GitHub Release 的内容不可变、可恢复发布和最终资产验证。
- 商店长期文案、版本证据和状态检查的分离。
- 扩展仓库 `AGENTS.md`、工程质量、版本发布与本地化长期规则。
- 与主仓库 Web Activity 协议和跨仓发布验收契约的兼容性复核。

### 3.2 明确排除

- 不引入 Rust、ICU4X 或主应用的 Rust 语言包生成链。
- 当前没有复数需求时，不提前引入 CLDR 复数 DSL。
- 不建立 XLSX 翻译导入导出工作流；语言数量、外部译者或批量审校需求出现后再评估。
- 当前没有 RTL locale 时，不实施完整 RTL 布局；但新结构不得把未来 RTL 支持锁死。
- 不改变 Web Activity 线协议字段、认证方式或隐私数据边界，除非独立评审发现现有协议必须调整。
- 不借规范对齐扩展产品范围，不增加云同步、账号系统、遥测或团队能力。
- 不在本方案中实际执行远端 push、创建 tag、发布 GitHub Release、重新签名 Firefox 包或提交浏览器商店。

## 4. 第一性原理与不可违反的不变量

### 4.1 用户看到的是语言结果，系统保存的是语言无关事实

如果后台把“Patina 网页同步未开启”直接保存到 `lastMessage`，语言切换后 UI 只能猜测这段文本代表什么。这会让显示语言取决于错误发生时的语言，而不是当前用户选择。正确模型是保存稳定的状态码、错误码和必要参数，UI 在渲染时使用当前 locale 解析。

- [x] 持久化状态不包含由本扩展生成的中文或英文用户文案。
- [x] UI 显示只依赖稳定代码、结构化参数和当前 locale。
- [x] 来自外部服务的原始消息只作为受控诊断信息，不作为稳定控制流，也不直接覆盖已知错误的本地化文案。

### 4.2 人工只维护一个语言事实源

重复对象、HTML fallback、两个浏览器各自的 `_locales` 都允许同一句话被分别修改。只要存在多个可人工编辑副本，漂移不是偶发缺陷，而是结构必然。

- [x] 每个 locale、每个消息键只有一个人工维护源。
- [x] `_locales`、Popup/Options 运行时目录和其他分发文件由生成器生成。
- [x] 生成器输出可重复；同一提交连续生成两次必须得到零 diff。
- [x] 生成文件有清晰标记，检查脚本禁止绕过源文件直接修改。

### 4.3 双浏览器差异必须是显式适配，不是复制后的偶然差异

Chromium 与 Firefox 的产品能力相同，差别主要来自 API namespace、Firefox 可选技术数据授权和 manifest 平台字段。共同逻辑应共享来源；平台差异应可列举、可测试。

- [x] 所有保留的目标差异都在适配边界或检查清单中有名称和理由。
- [x] 共同的语言键、状态映射、DOM 契约和隐私断言由同一来源驱动。
- [x] 修改一个目标但遗漏另一个目标时，`npm run check` 必须失败。

### 4.4 发布可信度来自字节证据，不来自流程成功提示

同一个版本名若可以在 GitHub Release 上被不同字节覆盖，就无法证明用户下载的是哪一份包。但完全禁止同 tag 重跑又会让网络中断后的恢复过于脆弱。因此采用“内容不可变、发布动作可恢复”：已有同名资产只有在哈希与本次已验证产物相同时才能保留或续传；不同则立即失败。

- [x] 每个正式资产都有 SHA-256 证据。
- [x] 同版本、同文件名、不同哈希永远不能被自动覆盖。
- [x] 工作流允许补齐缺失资产，但不能改写已存在的不同内容。
- [x] 发布后重新下载远端资产并验证，而不是只相信上传步骤返回成功。

### 4.5 长期文档描述规则，版本记录描述某次事实

“Chrome 0.2.0 正在审核”会很快过期，而商店 ID、必填披露和提交流程相对稳定。两类信息放在同一事实源中，普通检查很难判断一句自然语言是否已失效。

- [x] 长期 Listing 文件只保留可复用文案、稳定标识和提交流程。
- [x] 版本日期、包哈希、审核结果和平台记录放入独立的版本化证据文件。
- [x] 自动检查能发现长期文档重新出现“awaiting review”“currently in review”等易腐状态。

### 4.6 工具链是可执行输入，不是宽泛建议

仓库实际依赖 Node 原生 TypeScript type stripping，却声明支持不具备该能力的 Node 20；CI 又固定 Node 22，而主仓库使用另一套精确版本。只写 `>=20` 无法重现本地和 CI 行为。

- [x] Node 和 npm 使用仓库级精确版本事实源。
- [x] `package.json`、CI 和开发说明引用同一契约。
- [x] `@types/node` 主版本与运行时 Node 主版本一致。
- [x] 脚本不再依赖已经无必要的实验参数。

## 5. 完成定义

本方案只有满足以下总条件才算仓库内完成：

- [x] 本文识别的每个问题都在第 21 节追踪矩阵中映射到完成任务和证据。
- [x] `npm run check` 从干净 checkout 通过。
- [x] `npm run release:check -- 0.2.1` 或最终确认版本通过。
- [x] 本地化生成连续运行两次后工作树保持干净。
- [x] Chromium 与 Firefox 的语言键、状态代码、页面 DOM 契约和共同测试一致。
- [x] 两种语言下的 Popup 与 Options 人工检查通过。
- [x] 键盘和动态状态无障碍验收通过。
- [x] 运行时错误矩阵覆盖两个浏览器目标。
- [x] 连续两次确定性打包得到相同 SHA-256。
- [x] 发布工作流不存在静默覆盖路径，且具备安全恢复和远端回读验证。
- [x] 顶层长期文档与版本化事实记录不再互相矛盾。
- [x] 主仓库与扩展仓库的协议文档继续一致；若跨仓发布契约变更，两边已在同一执行窗口同步。
- [x] 工作树中没有无关改动、临时产物、真实 token、私钥或商店凭据。

远端发布完成还需要额外满足：

- [ ] 维护者明确授权当前任务 push。 — 未完成：未获得 push 授权
- [ ] 维护者分别明确授权 tag、GitHub Release 或商店操作。 — 未完成：未获得 tag、Release 或商店授权
- [ ] 三个浏览器商店的版本占用和公开状态已重新检查。 — 未完成：公开状态已核验，Chrome/Edge 私有 draft 占用无法从公开来源证明
- [ ] GitHub Release 远端资产哈希与本地最终证据一致。 — 未完成：0.2.1 Release 尚不存在

## 6. 已知基线与问题台账

以下是制定本文时观察到的事实，执行者仍须在开始时重新验证，不得假设它们永久成立。

### 6.1 已知健康项

- 扩展仓库位于 `main`，观察时 HEAD 为 `ad956ab`，版本和最新 tag 为 `0.2.0` / `v0.2.0`。
- 观察时工作树干净，`main` 与 `origin/main` 没有已显示的分叉。
- `npm run check` 通过版本、Chromium、Firefox、Firefox lint、运行时隐私和商店素材检查。
- `docs/web-activity-protocol.md` 与主仓库同名文件的 SHA-256 都是 `5E767F92DF4E579B42FBECD76D521270B58AF4E688A79B7D255FDBAFB8F7DFED`。
- Chromium `0.2.0` 确定性包的已记录 SHA-256 为 `EBD361E597D893C336838DF8D5E995FD4428FE3758B2F65A45BAB20054F227C5`。
- Firefox `0.2.0` 未签名上传包的已记录 SHA-256 为 `D935B77D6AA2FA9599A0DEA7AC44336DA29EDBF7B23F25C6F4757F2A4AC53038`。
- `docs/store-submission.md` 已记录 Chrome、Firefox 和 Edge 的 `0.2.0` 均公开。

### 6.2 已知待解决项

| ID | 问题 | 直接风险 | 主要负责人/位置 |
| --- | --- | --- | --- |
| P-01 | 扩展仓库没有对齐主仓库最新本地化规范 | 新文案继续以硬编码和重复副本增长 | `docs/localization.md`、`AGENTS.md` |
| P-02 | `OPTIONS_TEXT` 和 `POPUP_TEXT` 在两个目标各自维护 | 语言键、翻译和行为漂移 | `src/*/options.js`、`src/*/popup.js` |
| P-03 | HTML fallback、ARIA 文案、后台消息硬编码 | 切换语言后出现混合语言，检查无法闭环 | `src/*/*.html`、`src/*/background.js` |
| P-04 | 后台把本地化消息写入 `lastMessage` | 状态与发生错误时的语言绑定 | storage 状态模型 |
| P-05 | `_locales` 只覆盖名称和描述且双目标重复 | manifest 与 UI 不共享语言事实源 | `src/*/_locales` |
| P-06 | 没有 schema、registry、生成器、review manifest 和硬编码门禁 | 无法证明语言集合完整、生成结果可信 | 新建 `locales/`、`scripts/i18n/` |
| P-07 | 语言菜单缺少完整键盘和焦点行为 | 键盘与读屏用户无法可靠操作 | `src/*/options.html/js` |
| P-08 | Popup 动态状态没有 live region | 状态变化可能不被辅助技术感知 | `src/*/popup.html` |
| P-09 | 两个目标存在大段复制且没有 parity gate | 单目标修复可静默遗漏另一目标 | 构建脚本与检查脚本 |
| P-10 | Node 声明、CI、参数和类型定义不一致 | 支持范围虚假，本地与 CI 不可复现 | `package.json`、workflow、`.node-version` |
| P-11 | 运行时测试只模拟成功响应 | 非 JSON、空响应、HTTP 错误和显式失败可能回归 | `scripts/check-runtime-privacy.ts` |
| P-12 | 运行时测试硬编码 `0.2.0` | 版本提升后测试产生隐性重复维护 | `scripts/check-runtime-privacy.ts` |
| P-13 | Release workflow 使用 `overwrite_files: true` | 同版本资产可被静默替换 | `.github/workflows/release.yml` |
| P-14 | Release 缺少并发锁、校验和清单、证明和远端回读 | 半完成发布和供应链证据不足 | release workflow / scripts |
| P-15 | `STORE_LISTING.md` 仍称 Chrome、Edge 在审核 | 长期事实源互相矛盾 | `STORE_LISTING.md` |
| P-16 | 商店检查脚本发现不了自然语言状态过期 | 同类陈旧状态会再次出现 | `scripts/check-store-assets.ts` |
| P-17 | 扩展 `AGENTS.md` 的 push 规则过于简略 | commit、push、tag 和 release 授权可能混淆 | `AGENTS.md` |
| P-18 | 发布恢复规则与主仓库的新不可变发布要求不一致 | 跨仓验收标准含义不同 | 两仓版本发布政策 |

## 7. 总体执行顺序与阶段门

必须按下面顺序推进，除非在执行记录中说明为什么调整不会破坏依赖：

1. 冻结可信基线。
2. 确认长期规则和关键设计决策。
3. 对齐工具链，确保后续生成器和检查在固定环境运行。
4. 建立本地化 schema、registry、生成器和自测。
5. 迁移状态模型和全部用户文案。
6. 收敛双目标共同源并补齐无障碍行为。
7. 扩展运行时、隐私、本地化和 parity 测试。
8. 收紧发布工作流和商店文档。
9. 完成全量验证、确定性打包和版本准备。
10. 在单独授权下提交、推送或发布；否则停在本地可审阅状态。

每一阶段使用以下三态：

- `[ ]` 未开始或未满足全部证据。
- `[~]` 仅可在执行记录中临时表示进行中；提交前不得保留 `[~]`。
- `[x]` 实现、验证和证据齐全。

## 8. 阶段 0：冻结可信基线

### BASE-01 检查仓库身份和改动边界

目的：防止在错误仓库、错误分支或带有未知用户改动的状态下执行。

- [x] 在 `Patina-Web-Sync` 根目录执行：

```powershell
git remote -v
git status --short --branch
git rev-parse HEAD
git tag --points-at HEAD
node --version
npm --version
```

- [x] 记录实际 HEAD、分支、tag、Node 和 npm 版本。
- [x] 若存在未提交改动，逐项确认归属；不覆盖、不回退、不把无关改动纳入本任务。
- [x] 若当前分支不是预期 `main`，先停下确认，不自行创建分支或 PR。

通过标准：仓库身份明确，工作边界可证明，没有未知改动会被覆盖。

执行证据：

- HEAD：`待填写`
- 分支：`待填写`
- 工作树说明：`待填写`
- Node/npm：`待填写`

### BASE-02 运行修改前验证

- [x] 执行 `npm ci`；若 lockfile 与安装结果不一致，停止并查明原因。
- [x] 执行 `npm run check`。
- [x] 执行 `npm run release:check -- 0.2.0`，只验证当前版本，不发布。
- [x] 保存成功摘要；若失败，把失败记为基线缺陷，不得把它伪装成本次改动引入。

通过标准：当前版本可从干净依赖安装中通过既有检查和打包检查。

### BASE-03 记录现有包的字节证据

- [x] 定位 Chromium ZIP、Firefox 未签名 ZIP，以及缓存中的 AMO listed XPI（若存在）。
- [x] 使用 `Get-FileHash -Algorithm SHA256 <absolute-path>` 记录哈希。
- [x] 使用归档查看工具记录根目录结构、manifest version 和稳定 Gecko id。
- [x] 确认观察到的 `0.2.0` ZIP 哈希与第 6.1 节记录一致；若不一致，停止并查明生成条件。
- [x] 不重新签名 `0.2.0` Firefox 包。

通过标准：后续可明确区分“旧公开版本证据”和“新候选版本产物”。

### BASE-04 复核跨仓协议基线

- [x] 分别计算主仓库和扩展仓库 `docs/web-activity-protocol.md` 的 SHA-256。
- [x] 比较跨仓签名契约段落，确认字段、认证、隐私和错误语义一致。
- [x] 若协议仍完全一致，将其记录为“无需修改”；不要为了制造改动而重写文件。
- [x] 若发现真实差异，暂停后续实现，先按跨仓协议变更流程评审。

通过标准：语言工程和发布工程不会偷偷改变 Web Activity 线协议。

### 阶段 0 退出条件

- [x] BASE-01 至 BASE-04 全部完成。
- [x] 基线失败和已存在改动均有明确归属。
- [x] 没有执行任何远端或签名操作。

## 9. 阶段 1：同步治理与长期规范

### GOV-01 新增扩展本地化长期规范

目标文件：`docs/localization.md`。

- [x] 以主仓库规范为原则来源，但针对纯 WebExtension 仓库重新表述，不复制 Rust、ICU4X、XLSX 等不适用实现。
- [x] 定义支持 locale 的规范名称：应用运行时使用 `zh-CN`、`en-US`；生成 WebExtension `_locales` 时映射为 `zh_CN`、`en`。
- [x] 明确 `locales/` 是人工维护源，`src/*/_locales` 和目标运行时字典是生成产物。
- [x] 要求 locale 是渲染的显式输入；任何 locale 相关缓存都必须把 locale 纳入 key。
- [x] 要求状态、错误和持久化数据使用稳定代码，不保存扩展生成的本地化句子。
- [x] 要求 HTML 的用户可见 fallback、`title`、`aria-label`、帮助文本和错误消息进入同一消息契约。
- [x] 明确协议字段、数据库字段、token、URL、浏览器 API 标识等不可机械翻译。
- [x] 定义硬编码检查、精确例外格式、例外 owner/reason 和过期例外失败规则。
- [x] 定义 `review-manifest`：中文源文案变化时必须更新人工审核哈希；纯生成变化不得冒充完成审校。
- [x] 定义最低命令：`npm run i18n:generate`、`npm run check:i18n:self-test`、`npm run check:i18n`。

通过标准：维护者只读此文档即可判断一个新字符串应该放在哪里、如何生成、如何审校和如何验证。

### GOV-02 更新顶层协作入口

目标文件：`AGENTS.md`。

- [x] 在 Always Read First 中加入 `docs/localization.md`。
- [x] 增加语言硬规则：禁止新增人工作业源外的用户可见硬编码；生成文件不得手改。
- [x] 增加状态模型规则：后台和 storage 保存代码与参数，前台按当前 locale 渲染。
- [x] 增加双目标规则：共同产品行为必须共享源或有 parity gate，平台差异必须显式列举。
- [x] 同步当前任务授权语义：本地 commit 不等于 push；授权不跨任务沿用；push 不授权 tag、Release、签名和商店操作；未明确要求不得创建分支或 PR。
- [x] 保留扩展仓库原有 Firefox 版本前进、AMO listed XPI 和三商店公开后再打正式 tag 的约束。

通过标准：代理无法从“完成”“提交”“同步”等模糊用语推导远端副作用。

### GOV-03 更新工程质量规范

目标文件：`docs/engineering-quality.md`。

- [x] 增加本地化生成、键集合、review hash、硬编码和双目标 parity 的最低门禁。
- [x] 增加错误响应动态测试矩阵要求。
- [x] 增加语言菜单键盘行为和动态状态 live region 的无障碍验收。
- [x] 增加确定性生成和连续生成零 diff 要求。
- [x] 明确 `npm run check` 必须包含 `check:toolchain`、`check:i18n`、parity 和运行时矩阵。

### GOV-04 确认内容不可变、可恢复的发布语义

目标文件：扩展 `docs/versioning-and-release-policy.md`；若成为跨仓验收条件，同时更新主仓库同名文档。

- [x] 删除“同 tag 可以刷新同版本资产”这类允许任意覆盖的表述。
- [x] 写明既有同名资产的处理矩阵：
  - 远端不存在：允许上传已验证产物。
  - 远端存在且 SHA-256 相同：视为已满足，不重复改写。
  - 远端存在且 SHA-256 不同：立即失败，禁止覆盖。
  - Release 只缺部分资产：只允许补齐缺失且已验证的资产。
  - Release notes 需要恢复：只有资产检查通过后才允许幂等更新说明。
- [x] 写明同版本 Firefox XPI 必须来自 AMO 公开 listed 版本，不能重新本地签名。
- [x] 写明发布完成必须回读 GitHub Release 资产并验证名称、数量、大小和 SHA-256。
- [x] 写明 `SHA256SUMS` 与 attestation 属于正式发布证据。
- [x] 逐字复核主仓库跨仓接受条件；若扩展政策已经改变它的含义，两仓必须同批更新。

决策点：若维护者不接受“允许补齐缺失资产”的恢复模式，应改成更严格的“Release 已存在即失败”。在选择前不得实现相互矛盾的 workflow。

### GOV-05 规范文档自检

- [x] 检查新增规则只存在于正确的长期文档，没有散落到 README 或本计划充当唯一事实源。
- [x] 检查所有中文 Markdown 为 UTF-8，无 mojibake。
- [x] 检查术语统一使用 locale、消息键、状态码、错误码、生成产物、listed XPI、内容不可变。
- [x] 检查排除项和未来升级触发条件明确。

### 阶段 1 退出条件

- [x] GOV-01 至 GOV-05 全部完成。
- [x] 关键设计不再依赖执行者临场猜测。
- [x] 若跨仓契约需要修改，主仓库对应工作已明确纳入同一验收窗口。

## 10. 阶段 2：统一 Node/npm 工具链

### TOOL-01 选择并记录精确版本

默认建议与主仓库当前工具链一致：Node `24.18.0`、npm `11.16.0`、`@types/node` 主版本 `24`。执行时必须读取主仓库当前事实源重新确认，不能把本文的观察值当永久值。

- [x] 读取主仓库 `.node-version` 和 `package.json` 的 `devEngines`。
- [x] 确认扩展依赖 `web-ext` 在目标 Node/npm 上安装和运行正常。
- [x] 将最终 Node 精确版本写入扩展 `.node-version`。
- [x] 将 npm 精确版本写入 `package.json` 的 `devEngines`；`engines` 与实际支持策略保持一致，不再声称支持无法运行脚本的 Node 20。
- [x] 将 `@types/node` 调整到运行时 Node 的同主版本。
- [x] 执行 `npm install --package-lock-only` 或项目认可的依赖更新流程，检查 lockfile 只包含预期变化。

### TOOL-02 移除实验参数漂移

- [x] 在目标 Node 上直接执行 `node scripts/check-version-consistency.ts`，确认原生 type stripping 可用。
- [x] 从 package scripts 中移除全部 `--experimental-strip-types`。
- [x] 运行所有 `.ts` 脚本，确认没有依赖仅在实验参数下存在的行为。
- [x] 若 Node 发出 type stripping 警告或不支持语法，优先调整脚本 TypeScript 语法；不要重新扩大虚假 Node 支持范围。

### TOOL-03 让 CI 引用同一事实源

- [x] `.github/workflows/check.yml` 使用 `node-version-file: .node-version`。
- [x] `.github/workflows/release.yml` 使用相同配置。
- [x] 两个 workflow 都使用锁文件缓存，且通过 `npm ci` 安装。
- [x] 不在 YAML 中留下另一份硬编码 Node 主版本。

### TOOL-04 增加工具链一致性检查

建议新增 `scripts/check-toolchain.ts` 和 `check:toolchain`。

- [x] 检查 `.node-version` 是精确三段版本。
- [x] 检查 `package.json` 的 Node/npm 契约与 `.node-version` 一致。
- [x] 检查 `@types/node` 主版本与 Node 主版本一致。
- [x] 检查 workflow 使用 `node-version-file`，不存在 `node-version: 22` 等旁路。
- [x] 检查 package scripts 不再出现 `--experimental-strip-types`。
- [x] 把 `check:toolchain` 放在 `npm run check` 的前部，使环境错误尽早失败。

### TOOL-05 验证

- [x] 删除并重新安装依赖后执行 `npm ci`。
- [x] 执行 `npm run check:toolchain`。
- [x] 执行 `npm run check`。
- [x] 检查 package-lock 没有无关大范围升级。
- [x] 检查 CI workflow 的 YAML 语法和 action 输入有效。

### 阶段 2 退出条件

- [x] 本地、CI 和类型定义只有一个工具链契约。
- [x] Node 20+ 的虚假支持声明已消失。
- [x] 后续生成和检查都可在固定环境复现。

## 11. 阶段 3：建立本地化基础设施

### I18N-01 建立人工维护源目录

建议结构：

```text
locales/
  schema.ts
  registry.ts
  review-manifest.ts
  en-US/
    ui.ts
    manifest.ts
  zh-CN/
    ui.ts
    manifest.ts
scripts/
  i18n/
    generate.ts
    check.ts
    check-hardcoded.ts
    self-test.ts
```

- [x] `schema.ts` 定义消息键、locale 名称、插值参数和 UI/manifest 域，不存放具体翻译。
- [x] `registry.ts` 定义默认 locale、支持 locale、WebExtension locale 映射和各语言模块入口。
- [x] `ui.ts` 覆盖 Popup、Options、状态、错误、无障碍名称和帮助文本。
- [x] `manifest.ts` 覆盖扩展名称、扩展描述和需要从同一源生成的商店短描述。
- [x] locale 模块使用精确类型约束，缺键、增添未知键和插值参数不一致在 Node 检查时失败。
- [x] 保持当前产品默认行为：旧的空值和未知值回落到 `zh-CN`；旧存储值 `en` 规范化为 `en-US`。
- [x] 品牌名、Token、URL、HTTP、浏览器 API 标识等不应翻译的值在 schema 或注释中明确标记。

通过标准：删除任意一个 locale 的必需键，`check:i18n` 会稳定失败并指出 locale 和键。

### I18N-02 定义消息键命名与参数规则

- [x] 键名按界面和语义命名，例如 `options.headerDescription`、`popup.currentPageLabel`、`status.connected`、`error.invalidToken`、`a11y.languageMenuLabel`。
- [x] 禁止用英文句子或中文原文当键，避免改文案时改变程序标识。
- [x] 相同语义复用同一键；只是当前文本相同但语义不同的内容使用独立键。
- [x] 动态数据通过命名参数传入，例如 `{statusCode}`、`{httpStatus}`；禁止在调用点拼接本地化前缀。
- [x] 检查所有 locale 对同一键使用完全相同的参数集合。
- [x] 当前没有复数需求时只实现简单命名插值，并在 schema 中禁止未声明参数。

### I18N-03 建立生成器

`scripts/i18n/generate.ts` 至少生成：

- `src/chromium/_locales/en/messages.json`
- `src/chromium/_locales/zh_CN/messages.json`
- `src/firefox/_locales/en/messages.json`
- `src/firefox/_locales/zh_CN/messages.json`
- Popup/Options 运行时使用的目标无关目录或构建期字典文件
- 若商店短描述由仓库维护，则生成对应的可引用片段或机器可验证快照

执行要求：

- [x] 对 locale 和消息键进行稳定排序。
- [x] 固定 JSON 缩进、换行和结尾换行。
- [x] 输出头或伴随清单说明文件是生成产物以及源路径。
- [x] 使用临时目录完整生成并校验后再替换目标，避免半生成状态。
- [x] 相同输入连续运行两次必须零 diff。
- [x] 生成失败不得留下部分目标已更新、另一目标未更新的状态。
- [x] 生成 WebExtension locale 时正确映射 `en-US -> en`、`zh-CN -> zh_CN`。
- [x] manifest 消息使用 WebExtension `__MSG_key__` 语法，并检查两个 manifest 引用存在的键。
- [x] 将 `i18n:generate` 加入 `package.json`。

### I18N-04 建立人工审核清单

`review-manifest.ts` 应记录每个 locale 的审核状态和源哈希，而不是只写一个容易被忘记的布尔值。

- [x] 定义规范化哈希算法：按稳定键序列序列化源消息和参数后计算 SHA-256。
- [x] `zh-CN` 源文案变化导致哈希变化时，检查要求更新对应 locale 的审核记录。
- [x] `en-US` 审核记录至少包含被审校的中文源哈希、英文译文哈希、审核日期和 reviewer 标识。
- [x] 纯排序、生成格式或目标复制变化不得改变源审核哈希。
- [x] 不允许生成器自动把新译文标记为“已人工审核”。
- [x] 初次迁移可把现有中英文文案作为导入批次，但仍需维护者实际审读后填写 reviewer。

### I18N-05 建立硬编码检查与精确例外

`scripts/i18n/check-hardcoded.ts` 扫描人工维护的 HTML、JS、TS、JSON 和相关 Markdown 源。

- [x] 捕获 DOM `textContent`、`innerText`、`aria-label`、`title`、状态消息和模板字符串中的用户可见硬编码。
- [x] 捕获 `lastMessage` 等状态字段写入中文或英文句子的情况。
- [x] 捕获 HTML 节点中的人工 fallback 文案，但允许品牌名、协议词和生成标记等精确例外。
- [x] 不把代码标识、日志内部标识、URL、CSS、测试期预期文本一概误判为用户文案；测试文本需在测试文件规则中管理。
- [x] 例外必须精确到文件、值或模式、owner、reason；宽泛目录排除不合格。
- [x] 例外指向的文本消失后，检查因“过期例外”失败，促使删除例外。
- [x] 对 `src/*/_locales` 和其他生成目录只做“与生成结果一致”检查，不当作人工源扫描。

### I18N-06 建立自测

`scripts/i18n/self-test.ts` 应在临时 fixture 上主动证明检查器会失败，而不只是对当前仓库跑一次成功路径。

- [x] 缺少消息键时失败。
- [x] 多出未知键时失败。
- [x] 插值参数不一致时失败。
- [x] 非法 locale 映射时失败。
- [x] 生成产物被手改时失败。
- [x] 用户可见硬编码时失败。
- [x] 精确例外合法时通过。
- [x] 例外过期时失败。
- [x] review hash 过期时失败。
- [x] 非确定性排序或重复生成有 diff 时失败。
- [x] 自测 fixture 创建在系统临时目录并保证清理，不污染仓库。

### I18N-07 接入统一检查

- [x] 新增 `check:i18n:self-test`。
- [x] 新增 `check:i18n`，内部按顺序执行 schema/registry、review manifest、生成一致性和硬编码检查。
- [x] `npm run check` 先执行自测，再检查当前仓库。
- [x] CI 中不得用自动重新生成掩盖未提交的生成产物；检查应生成到临时目录后比较。

### 阶段 3 退出条件

- [x] I18N-01 至 I18N-07 全部完成。
- [x] 还未迁移全部 UI 时，允许检查使用短期精确例外，但每个遗留点都有 owner 和下一阶段任务 ID。
- [x] 生成器、自测和检查器都能在固定工具链下运行。

## 12. 阶段 4：迁移语言无关状态模型

状态模型必须先于 UI 文案迁移稳定，否则 UI 会继续为历史自由文本编写猜测逻辑。

### STATE-01 定义稳定状态与错误代码

建议保留当前状态集合并明确语义：

```text
lastStatus:
  disabled | configured | connecting | connected |
  disconnected | private | needs-config | error

lastErrorCode:
  none | missing-token | invalid-token | web-recording-disabled |
  http-error | invalid-response | service-rejected |
  request-failed | unknown-service-error
```

- [x] 为每个状态写明产生条件、是否可重试、UI tone 和默认动作。
- [x] 为每个错误码写明来源、允许参数和用户文案键。
- [x] 不把 HTTP status、服务端 message 或 JavaScript exception 拼进错误码。
- [x] `lastSeenAt` 保持数值时间戳，不参与本地化。
- [x] 如果保留诊断详情，使用独立的 `lastErrorDetail`，限制长度，不保存 token，不直接显示给用户。
- [x] 若需要 HTTP 状态，使用结构化 `lastErrorParams: { httpStatus }`，并验证可序列化和值域。

### STATE-02 修改后台写入边界

目标：`src/chromium/background.js`、`src/firefox/background.js`，以及后续提取的共享纯函数。

- [x] 将 `setStatus(lastStatus, lastMessage)` 替换为结构化状态写入函数。
- [x] 没有 token 时写入 `needs-config` + `missing-token`。
- [x] 本机服务明确 `enabled: false` 时写入 `disabled` + `web-recording-disabled`。
- [x] 401/403 或协议定义的认证失败写入 `error` + `invalid-token`。
- [x] 其他非 2xx 写入 `error` + `http-error`，只记录安全的 HTTP status 参数。
- [x] 2xx 非 JSON、空对象或缺少 `ok: true` 写入 `error` + `invalid-response`。
- [x] JSON 明确 `ok: false` 且有稳定 `code` 时映射已知 code；未知 code 写入 `service-rejected` 或 `unknown-service-error`。
- [x] fetch/network/timeout 异常写入 `error` + `request-failed`。
- [x] 成功后清空旧错误 code、params 和 detail，避免旧错误污染新状态。
- [x] Chromium 和 Firefox 使用相同的错误分类纯函数；Firefox 的 optional technical data 只影响 payload 字段，不影响错误语义。

### STATE-03 迁移旧 storage

- [x] 读取旧 `lastMessage` 时只做一次兼容映射，不再新增自由文本写入。
- [x] 对已知旧消息映射到稳定错误码：无效 token、缺少 token、网页同步关闭。
- [x] 未知旧文本映射为 `unknown-service-error`；若保留原文，只进入受限诊断字段。
- [x] 迁移成功后删除 `lastMessage`，写入新字段和状态模型版本，例如 `statusSchemaVersion: 1`。
- [x] 迁移函数必须幂等：重复运行不改变已经迁移的数据。
- [x] 测试空 storage、当前 `0.2.0` storage、部分损坏值和已迁移值。
- [x] 语言字段同时规范化：`en -> en-US`、`zh-CN -> zh-CN`、未知值 -> 默认 locale。

### STATE-04 删除基于自然语言的控制流

- [x] 删除 Options 中对“无效”“invalid token”“unauthorized”等文本内容的猜测。
- [x] 删除通过 `lastMessage` 是否为空决定 Popup 状态的逻辑。
- [x] UI 只根据 `lastStatus`、`lastErrorCode` 和结构化参数选择消息键。
- [x] 外部原始消息不能改变按钮是否可用、tone 或重试策略。

### STATE-05 状态模型验证

- [x] 为状态分类纯函数增加表驱动测试。
- [x] 为 storage 迁移增加输入/输出 fixture。
- [x] 证明切换语言不会修改状态码、错误码、时间戳或诊断数据。
- [x] 证明同一个已保存错误在 `zh-CN` 与 `en-US` 下显示相应语言。
- [x] 证明未知服务端消息不会原样成为主 UI 文案。

### 阶段 4 退出条件

- [x] 后台和 storage 不再写入本扩展生成的用户可见句子。
- [x] `lastMessage` 仅作为迁移输入存在，运行时 schema 不再依赖它。
- [x] 状态与错误分类在两个浏览器目标一致。

## 13. 阶段 5：迁移全部用户可见语言

### COPY-01 迁移 Options 文案

- [x] 将现有 `OPTIONS_TEXT` 的全部语义键迁入 `locales/<locale>/ui.ts`。
- [x] 覆盖页头说明、服务标题、端口、Token、按钮、同步内容、保存/同步中状态、配置错误和 token 可见性名称。
- [x] 删除 `OPTIONS_TEXT` 及其 Firefox 副本。
- [x] `copy()` 或替代 API 必须接收规范 locale，不能隐式读取全局语言后缓存错误结果。
- [x] 动态 token 可见性、保存状态和错误状态每次根据当前 locale 渲染。

### COPY-02 迁移 Popup 文案

- [x] 将现有 `POPUP_TEXT` 的全部语义键迁入语言源。
- [x] 覆盖当前网页、加载、无活动页、非 HTTP(S)、设置、配置、同步动作、全部状态、私密窗口和帮助文本。
- [x] 删除 `POPUP_TEXT` 及其 Firefox 副本。
- [x] 页面标题、按钮、badge 和私密窗口说明统一通过消息 API 渲染。

### COPY-03 迁移 HTML fallback 和无障碍文本

推荐做法是把 Popup/Options 的人工维护模板放到共享 UI 目录，只保留稳定的 `data-i18n`/`data-i18n-aria-label` 等消息引用，再由构建或生成步骤产出每个目标的实际文件。

- [x] 迁移 `headerDescription`、`serviceTitle`、`portLabel`、按钮、note、Popup 加载状态等 HTML 文本。
- [x] 迁移 `aria-label="Languages"`、显示/隐藏 Token 等辅助名称。
- [x] 品牌名 `Patina Web Sync` 可以作为精确不翻译值，但必须在例外或 schema 中说明。
- [x] `Token` 若保留英文，作为产品/协议术语明确标记；不得因遗漏而偶然留下。
- [x] 避免未本地化内容闪烁：在首帧渲染前应用 locale，或由生成器为默认 locale 生成受控 fallback。
- [x] 如果使用默认 locale fallback，它也必须由语言源生成，不能在 HTML 模板中人工重复维护。
- [x] 脚本失败时页面仍保留可操作的安全失败状态；不要用永久 `visibility: hidden` 造成空白页面。

### COPY-04 统一 manifest 与商店短描述

- [x] 两个 manifest 的 `name` 和 `description` 使用 `__MSG_*__` 引用。
- [x] 两目标 `_locales` 由同一 `manifest.ts` 生成。
- [x] Chrome/Edge/Firefox 平台专属文案只有确有平台差异时才单独建键，并在名字中标明平台。
- [x] 商店短描述与 manifest 描述若语义相同，从同一键或明确派生规则产生；若长度限制不同，使用不同语义键，不能在目标文件手改截断。
- [x] 检查各平台字符数限制；超限时生成失败并指出 locale、键和限制。

### COPY-05 移除迁移例外

- [x] 删除阶段 3 为旧 `OPTIONS_TEXT`、`POPUP_TEXT`、HTML 和 `lastMessage` 添加的所有临时硬编码例外。
- [x] 运行硬编码检查并逐项解释剩余例外。
- [x] 确认没有通过重命名变量、字符串拆分或把文案搬到 JSON 旁路检查。

### COPY-06 双语言人工审校

- [ ] 审校 `zh-CN`：语义准确、术语与 Patina 主应用一致、没有过度技术化或机械翻译。 — 未完成：等待维护者 copy review
- [ ] 审校 `en-US`：自然、简洁、按钮使用动词、状态用词一致。 — 未完成：等待维护者 copy review
- [ ] 比较两种语言的插值、标点和大小写。 — 未完成：实现审查已完成，维护者 copy approval 待办
- [ ] 更新 `review-manifest.ts` 的真实 reviewer 和哈希。 — 未完成：哈希已更新，真实维护者 reviewer 待填写
- [x] 不使用执行代理身份虚构“人工审核完成”；无人审校时保持待审状态并阻止正式发布。

### 阶段 5 退出条件

- [x] 所有用户可见文案和辅助技术名称都可追溯到唯一语言源。
- [x] 两个目标的生成语言文件完全由同一 registry 驱动。
- [x] 语言切换后不会残留上一语言的状态或按钮名称。

## 14. 阶段 6：收敛双浏览器共同能力

### PARITY-01 明确共享所有权

建议建立 `src/shared/` 或等价的明确共享目录，并同步更新 `docs/architecture.md`。

- [x] Popup DOM 模板和产品逻辑归共享 UI 所有。
- [x] Options DOM 模板和产品逻辑归共享 UI 所有。
- [x] locale 规范化、消息格式化、状态到视图模型的映射归共享纯函数所有。
- [x] Chromium/Firefox storage、tabs、runtime messaging 通过很薄的平台 adapter 暴露共同接口。
- [x] Firefox optional technical data 授权保留在 Firefox 平台边界。
- [x] manifest、后台入口、平台 API adapter、README 和签名规则保留为目标专属。
- [x] 不为了消除几行差异制造厚重框架；共享的是稳定产品能力，不是把所有文件强行合并。

### PARITY-02 调整构建组合

- [x] Chromium build 把共享 UI、Chromium adapter、Chromium manifest、图标和生成 locale 组合到目标目录。
- [x] Firefox build 使用同一共享 UI，替换为 Firefox adapter 和 manifest。
- [x] 未打包开发流程有明确入口；README 不再要求直接加载一个缺少共享文件的目录。
- [x] build 先检查生成产物，再复制；不得在构建中静默修复未提交源。
- [x] 构建目录每次从已验证的空目标生成，避免旧文件残留。
- [x] 归档根目录继续直接包含 `manifest.json`，不引入多余版本目录。

### PARITY-03 建立 parity manifest

建议让检查脚本维护或生成一个明确的共同文件集合和允许差异集合。

- [x] 列出必须字节相同的共享 UI 文件。
- [x] 列出必须键集合相同但值可因平台不同的 manifest 字段。
- [x] 列出允许目标专属的文件和理由。
- [x] 构建后若出现未声明差异，检查失败。
- [x] 删除已经不再需要的目标副本，避免“共享源 + 旧副本”双重所有权。

### PARITY-04 建立行为一致性测试

- [x] 对同一 storage fixture，两个 adapter 产生同一 ViewModel。
- [x] 对相同 locale 和状态，Popup/Options 关键 DOM 文本和属性一致。
- [x] 对相同服务响应，两个后台得到同一状态码和错误码。
- [x] 只对 Firefox technical consent 和浏览器 API 调用方式断言允许差异。
- [x] 单独修改一个目标生成文件时 `check:parity` 失败。
- [x] 将 `check:parity` 接入 `npm run check`。

### PARITY-05 更新架构文档

- [x] 在 `docs/architecture.md` 记录共享 UI、平台 adapter、目标入口、生成语言文件和构建组合的所有权。
- [x] 明确 `shared` 只放两个目标都稳定需要的能力，不作为临时杂物目录。
- [x] 明确未来新增浏览器目标时必须实现 adapter 契约并通过同一 parity 测试。

### 阶段 6 退出条件

- [x] Popup/Options 不再以两份人工副本维护。
- [x] 平台差异列表有限、显式、可测试。
- [x] 修改共同能力时不可能只更新一个目标仍通过检查。

## 15. 阶段 7：修复无障碍行为

### A11Y-01 完整实现语言菜单模式

当前使用 `role="menu"` / `menuitemradio`，因此必须兑现菜单键盘契约；不能只添加 ARIA 名称而缺少实际行为。

- [x] 语言按钮增加 `aria-controls="language-menu"`，保留 `aria-haspopup="menu"` 和同步的 `aria-expanded`。
- [x] 菜单打开时，把焦点移到当前选中的 `menuitemradio`；若没有有效选中项，聚焦第一项。
- [x] 菜单项使用 roving `tabindex`：当前焦点项为 `0`，其他项为 `-1`。
- [x] `ArrowDown` / `ArrowUp` 在选项间循环移动。
- [x] `Home` / `End` 移到第一项 / 最后一项。
- [x] `Enter` / `Space` 选择当前项、保存 locale、重新渲染并关闭菜单。
- [x] `Escape` 关闭菜单并把焦点还给语言按钮。
- [x] 点击菜单外关闭；若关闭由键盘触发，确保焦点仍可预测。
- [x] `Tab` 离开控件时关闭菜单，不制造焦点陷阱。
- [x] 选择语言后更新 `aria-checked`、页面 `lang` 和所有可见/辅助文本。
- [x] locale display name（例如“简体中文”“English”）作为语言注册信息维护，不散落在 HTML。

### A11Y-02 动态状态可感知

- [x] Options 状态节点使用 `role="status"` 或等价的 `aria-live="polite"`，并增加 `aria-atomic="true"`。
- [x] Popup `#status-badge` 增加 `role="status"`、`aria-live="polite"`、`aria-atomic="true"`。
- [x] 页面初次加载不要重复播报无意义的占位文案。
- [x] 同步中、成功、失败、私密窗口和待配置变化都更新同一稳定 live region。
- [x] 视觉 tone 不作为唯一状态线索；文字必须独立表达状态。
- [x] 不把 URL、页面标题等频繁变化内容放入不必要的 live region。

### A11Y-03 焦点与控件状态

- [x] 为语言按钮、菜单项、Token 可见性按钮、保存和同步按钮检查清晰的 `:focus-visible`。
- [x] disabled 按钮既有原生 `disabled`，又不会被 click/keyboard handler 执行。
- [x] Token 可见性按钮同步 `aria-label` 和 `aria-pressed`。
- [x] 装饰图标继续使用 `aria-hidden="true"`，品牌图标保持空 alt，避免重复读出品牌名。
- [x] 页面缩放到 200% 时没有关键内容裁切，Popup 仍可操作。
- [x] 深色模式下焦点、成功和错误文字对比度仍可辨识。

### A11Y-04 自动化交互测试

在现有轻量脚本体系中增加 DOM/事件测试；若需要引入测试依赖，必须说明体积和维护成本。

- [x] 点击打开/关闭菜单。
- [x] 打开后焦点位于当前语言。
- [x] Arrow/Home/End 移动正确。
- [x] Enter/Space 选择并持久化规范 locale。
- [x] Escape 关闭并恢复焦点。
- [x] `aria-expanded`、`aria-checked`、`tabindex` 与真实状态一致。
- [x] Popup/Options 动态状态节点具有正确 live 属性。
- [x] Chromium 和 Firefox build 运行同一测试集。

### A11Y-05 人工验收

- [ ] 仅用键盘完整完成：切换语言、填写端口和 Token、显示/隐藏 Token、保存、同步当前页、打开设置。 — 未完成：已自动化覆盖；未做完整人工端到端操作
- [x] 在 Chromium 系浏览器验证。
- [ ] 在 Firefox 142+ 验证。 — 未完成：Firefox 152 安装/启动 smoke 已完成，人工键盘/状态矩阵未完成
- [ ] 使用至少一种 Windows 辅助技术或浏览器 Accessibility Tree 检查菜单角色、选中状态和 live region。 — 未完成：未执行真实辅助技术检查
- [x] 记录浏览器版本、操作系统、语言和结果。

### 阶段 7 退出条件

- [x] 语言菜单的 ARIA 声明与真实键盘行为一致。
- [x] 动态同步状态可被辅助技术感知。
- [ ] 两目标人工操作结果一致。 — 未完成：Chromium 可视化与 Firefox 启动 smoke 已完成，Firefox 人工交互未完成

## 16. 阶段 8：补齐运行时、隐私与语言测试矩阵

### TEST-01 重构响应测试夹具

目标文件：`scripts/check-runtime-privacy.ts`，必要时拆分为共享 harness 和表驱动 cases。

- [x] `runChromium` / `runFirefox` 接受可配置 fetch 行为，而不是固定返回成功。
- [x] 夹具可分别控制 HTTP status、`ok`、JSON 返回值、JSON parse error 和网络异常。
- [x] storage mock 记录每次 `set`，使测试能断言最终状态码、错误码、清理字段和迁移结果。
- [x] 消息监听 mock 能验证手动同步回调，不只直接调用内部函数。
- [x] 每个 case 使用全新 VM context 和 storage，防止状态互相污染。
- [x] 错误信息指出浏览器目标、case 名称、预期和实际结果。

### TEST-02 建立双目标服务响应矩阵

下面每一行必须对 Chromium 和 Firefox 执行；Firefox 还需在有/无 optional technical consent 两种模式下覆盖 payload 相关 case。

| Case | 模拟输入 | 预期状态 |
| --- | --- | --- |
| success | 2xx JSON `{ enabled: true, ok: true }` | `connected`，清空旧错误 |
| disabled | 409 JSON `{ enabled: false, code: "web-recording-disabled" }` | `disabled` + `web-recording-disabled` |
| explicit rejection | 2xx JSON `{ ok: false, code: <known> }` | 映射稳定错误码 |
| unknown rejection | 2xx JSON `{ ok: false, code: <unknown>, message: ... }` | 通用拒绝码，原文不直接显示 |
| empty object | 2xx JSON `{}` | `error` + `invalid-response` |
| null JSON | 2xx JSON `null` | `error` + `invalid-response` |
| non-JSON success | 2xx 且 `json()` 抛错 | `error` + `invalid-response` |
| unauthorized | 401/403 | `error` + `invalid-token` |
| HTTP error | 500 JSON 或非 JSON | `error` + `http-error` |
| network error | fetch reject | `error` + `request-failed` |
| missing token | storage token 为空 | `needs-config` + `missing-token`，不发请求 |
| private tab | `incognito: true` | 不发请求，写入/保持明确 private 语义 |
| internal URL | `chrome://` / `about:` | 不发请求 |
| complete URL | path/query/fragment | 完整 URL 原样进入 payload |

- [x] 对每个 case 断言请求数量、目标仅为 loopback、POST、Bearer header 和 JSON body。
- [x] 对每个 case 断言禁止字段 `tabId`、`windowId`、`capturedAtMs`、`eventReason` 不出现。
- [x] Firefox 无 optional consent 时断言省略 `browserClientId`、`browserKind`、`extensionVersion`。
- [x] Firefox 有 optional consent 时断言允许这些字段。
- [x] 任意失败 case 不得把 token、完整异常堆栈或任意服务端原文写入用户状态。

### TEST-03 删除测试版本硬编码

- [x] 测试从 `package.json` 读取预期版本。
- [x] 同时读取 Chromium 和 Firefox manifest，并复用版本一致性检查的事实。
- [x] runtime mock 的 `getManifest().version` 使用对应 manifest 版本。
- [x] payload 断言使用读取结果，不出现字面量 `0.2.0`。
- [x] 增加负例 fixture，证明 manifest/package 不一致时版本检查失败。

### TEST-04 增加本地化运行时矩阵

- [x] `zh-CN` 和 `en-US` 渲染所有状态码与错误码。
- [x] 旧 `en` storage 自动迁移为 `en-US`。
- [x] 未知 locale 回落到默认 locale 并写回规范值。
- [x] 切换语言后已有错误立即换语言，状态事实不改变。
- [x] 所有插值参数被替换，没有 `{name}` 泄漏到 UI。
- [x] 缺少参数时 fail closed 并在测试/开发阶段报出消息键，不静默显示残缺文案。
- [x] 未知错误码显示本地化通用错误，不显示 `undefined`、空 badge 或服务端原文。

### TEST-05 保持文档隐私断言但拆分职责

当前 `check-runtime-privacy.ts` 同时检查运行时代码和 README 文案。为让失败更可定位：

- [x] 将 README/分发说明检查移到独立 `check:docs` 或 `check:store-assets` 责任范围。
- [x] `check:runtime-privacy` 只负责运行时、storage、payload 和错误行为。
- [x] 文档检查继续保留已公开商店链接、listed XPI、禁止字段和已退休文案断言。
- [x] `npm run check` 同时执行两类检查，不能通过拆分丢失既有覆盖。

### TEST-06 验证测试自身有效

- [x] 临时反转 `data?.ok !== true` 判断或使用 fixture 注入缺陷，确认相应 case 会失败；完成后恢复，不提交故障注入。
- [x] 临时让一个目标发送禁止字段，确认双目标测试会失败；完成后恢复。
- [x] 临时修改一个 locale 键，确认 i18n/parity gate 会失败；完成后恢复。
- [x] 记录三项 mutation check 的失败摘要作为测试有效性证据。

### 阶段 8 退出条件

- [x] 成功、隐私、配置、HTTP、JSON、网络、语言和迁移边界都有动态测试。
- [x] 每个关键 case 同时覆盖 Chromium 和 Firefox。
- [x] 测试中不再复制当前版本号。

## 17. 阶段 9：收紧 GitHub Release 链

### RELEASE-01 拆分只读构建与写发布权限

目标：`.github/workflows/release.yml`。

- [x] workflow 顶层默认 `permissions: contents: read`。
- [x] 构建/验证 job 只拥有读取仓库所需权限。
- [x] 发布 job 仅在消费已验证 artifact 时获得 `contents: write`。
- [x] attestation 步骤所需的 `id-token: write` 和 `attestations: write` 只授予对应 job。
- [x] AMO 下载只访问公开 listed API，不引入签名 secret。
- [x] 不把发布 token、AMO 凭据或 bearer token 输出到日志和 artifact。

### RELEASE-02 增加并发与触发门

- [x] 使用 tag/ref 作为 concurrency group，例如 `patina-web-sync-release-${{ github.ref }}`。
- [x] `cancel-in-progress: false`，避免后一次运行把正在上传的正式发布取消到半完成。
- [x] 只允许符合 `vX.Y.Z` 或既有允许格式的 tag 触发。
- [x] 解析出的版本必须与 package 和两个 manifest 一致。
- [x] tag commit 必须通过完整 `npm run check` 和 release notes 检查。

### RELEASE-03 构建一次并传递已验证产物

- [x] 构建 job 使用 `.node-version`、`npm ci` 和精确 lockfile。
- [x] 只构建一次 Chromium ZIP。
- [x] 从 AMO 公共 API 下载同版本 public/listed Firefox XPI；验证 AMO 返回版本、channel/status、SHA-256、manifest version 和稳定 Gecko id。
- [x] 不运行 `extension:firefox:sign`。
- [x] 生成规范名称的 Chromium ZIP 和 Firefox XPI。
- [x] 生成按文件名稳定排序的 `SHA256SUMS`，至少覆盖 ZIP 和 XPI。
- [x] 对产物生成 GitHub Artifact Attestation。
- [x] 上传内部 workflow artifact；发布 job 只能下载此 artifact，不能重新构建。

### RELEASE-04 实现既有 Release 预检

建议新增 `scripts/release/preflight-release.ts` 或等价脚本，输入 tag、期望资产目录和远端 Release metadata。

- [x] Release 不存在时返回“可新建”。
- [x] Release 存在时枚举全部同名资产。
- [x] 下载既有 ZIP、XPI 和 `SHA256SUMS` 到临时目录，计算真实 SHA-256；不只相信文件名。
- [x] 已存在且与本次产物同哈希：标记为满足。
- [x] 已存在但哈希不同：输出文件名、远端哈希、本次哈希并立即失败。
- [x] 缺失资产：标记为允许补齐。
- [x] 出现计划外同名/近似命名资产时失败，防止 `file (1).zip` 之类旁路。
- [x] 临时目录清理，日志不包含凭据。

### RELEASE-05 移除覆盖路径并实现安全恢复

- [x] 删除 `overwrite_files: true`。
- [x] 不使用 `--clobber` 或等价覆盖选项。
- [x] 新 Release 优先以 draft 建立，完整上传和验证后再公开，减少半成品可见窗口。
- [x] 已有 Release 只上传预检标记为缺失的资产。
- [x] notes 更新发生在资产哈希预检之后；资产冲突时不得改 notes 制造“已恢复”假象。
- [x] 上传任一步失败时保持可诊断状态，不删除已验证且同哈希的远端资产。
- [x] 重跑遵循同一预检，能够幂等跳过相同资产并补齐缺失资产。

### RELEASE-06 发布后远端回读

建议新增 `scripts/release/verify-release-assets.ts`。

- [x] 重新查询 Release，确认 tag、标题和目标 commit 正确。
- [x] 确认正式资产集合恰好包含预期 ZIP、XPI、`SHA256SUMS` 及政策要求的其他证明文件。
- [x] 重新下载 ZIP/XPI/校验和文件。
- [x] 验证名称、非零大小、SHA-256 和 `SHA256SUMS` 内容。
- [x] 解包/读取两个 manifest，复核版本、manifest version 和稳定 Gecko id。
- [x] 验证 attestation 可查询并绑定正确 digest。
- [x] 只有全部通过后才把 draft 转正式或把 job 标记成功。

### RELEASE-07 发布 workflow 自测场景

在不触碰正式 tag/Release 的 fixture、脚本单元测试或临时测试仓库中覆盖：

- [x] Release 不存在。
- [x] Release 已存在且全部资产相同。
- [x] Release 已存在且缺一个资产。
- [x] Release 已存在且同名资产哈希冲突。
- [x] `SHA256SUMS` 缺行、多行、顺序错误或哈希错误。
- [x] AMO 返回非 listed、非 public、错误版本、错误 Gecko id 或错误哈希。
- [x] 两次并发运行不会互相覆盖。
- [x] 上传后回读发现资产缺失时失败。

### RELEASE-08 跨仓契约验收

- [x] 比较主仓库和扩展仓库发布接受条件。
- [x] 确认主应用版本是否声明支持本次协议版本。
- [x] 若 release 不可变性成为主仓库的正式接受条件，两仓文档和检查在同一变更窗口完成。
- [x] 协议正文没有变化时保持原文件字节不变。

### 阶段 9 退出条件

- [x] 正式资产不存在自动覆盖路径。
- [x] 发布可在缺失资产场景安全恢复，在内容冲突场景 fail closed。
- [x] 构建、哈希、attestation、上传和远端回读形成完整证据链。

## 18. 阶段 10：修复商店文档和状态检查

### STORE-01 分离长期 Listing 与版本证据

- [x] 将 `STORE_LISTING.md` 的定位改为“可复用商店文案和稳定提交字段的唯一来源”，不再声称它是所有动态审核状态的唯一来源。
- [x] 保留稳定内容：产品描述、功能、数据披露、权限理由、商店 ID、类别选择原则、支持链接和素材要求。
- [x] 删除或迁出带具体日期的“submitted”“awaiting review”“currently in review”等版本状态。
- [x] 检查英文/中文商店文案没有错误地提及其他浏览器平台。

### STORE-02 建立版本化商店记录

建议路径：`docs/store-releases/0.2.0.md`，未来每个正式商店版本单独一份。

- [x] 从 `docs/store-submission.md` 和 `STORE_LISTING.md` 汇总 `0.2.0` 的三个平台事实。
- [x] 记录候选/公开日期、包文件名、SHA-256、商店项目 ID 或版本 ID、Firefox listed/public 状态和最终审核结果。
- [x] 对同一 Chromium 包供 Chrome/Edge 使用的事实只记录一次哈希，并分别记录平台结果。
- [x] 标注证据来源和最后核验日期。
- [x] 不复制 token、账号邮箱、私有控制台 URL 或凭据。
- [x] `docs/store-submission.md` 保留长期流程，并链接到版本记录；删除重复的大段动态事实。

### STORE-03 修正当前矛盾

- [x] 删除 `STORE_LISTING.md` 中 Chrome `0.2.0` “awaiting review”的陈旧表述。
- [x] 删除 Edge `0.2.0` “currently in review”的陈旧表述。
- [x] 与 `docs/store-submission.md` 已记录的三商店公开事实一致。
- [x] 复核 README 和 reviewer instructions 没有类似已退休状态。

### STORE-04 扩展自动检查

目标：`scripts/check-store-assets.ts` 或独立 `scripts/check-store-docs.ts`。

- [x] 长期文档中禁止无版本记录承载的 `awaiting review`、`currently in review`、`pending approval` 等易腐状态短语。
- [x] 版本记录必须包含版本、目标平台、产物文件名、SHA-256、状态和核验日期。
- [x] SHA-256 必须是 64 位十六进制并与已缓存/生成产物一致（产物可用时）。
- [x] `STORE_LISTING.md` 中的稳定商店 ID 与版本记录一致。
- [x] 已退休分发文案继续作为 forbidden phrases 检查。
- [x] 检查错误必须指出文件、短语和应该迁往的版本记录位置。

### STORE-05 定义未来更新流程

- [x] 新候选版本仍在开发时，状态放 `[Unreleased]` 和工作记录，不把“审核中”写进长期 Listing。
- [x] 实际上传后创建/更新对应 `docs/store-releases/<version>.md`。
- [x] 审核结果变化只修改该版本记录。
- [x] 可复用文案、权限或披露规则变化才修改 `STORE_LISTING.md` 和长期提交指南。
- [x] 新版本发布完成后运行 store docs 检查并记录最终哈希。

### 阶段 10 退出条件

- [x] 长期文档不再包含已经失效的 `0.2.0` 审核状态。
- [x] `0.2.0` 的历史证据完整、可追溯、不会与下一版本混淆。
- [x] 自动检查能阻止同类易腐状态重新混入长期文档。

## 19. 阶段 11：全量验证与回归

### VERIFY-01 生成一致性

- [x] 在干净工作树运行 `npm run i18n:generate`。
- [x] 检查 `git status --short` 没有生成 diff。
- [x] 再运行一次 `npm run i18n:generate`。
- [x] 再次确认零 diff。
- [x] 手改一个临时生成文件并运行 `npm run check:i18n`，确认失败；随后用生成器恢复，不能手工猜测生成内容。

### VERIFY-02 完整自动检查

建议最终 `npm run check` 至少按下面的责任顺序覆盖：

1. `check:toolchain`
2. `check:versions`
3. `check:i18n:self-test`
4. `check:i18n`
5. `check:parity`
6. Chromium extension check
7. Firefox extension check
8. Firefox lint
9. runtime/privacy matrix
10. accessibility/DOM tests
11. store/docs/assets checks

- [x] 执行 `npm ci`。
- [x] 执行 `npm run check`。
- [x] 检查所有检查由单一命令从干净 checkout 可运行，不依赖未记录的全局工具。
- [x] 检查失败时有具体文件/case，不只返回通用 exit code。

### VERIFY-03 确定性打包

建议新增 `scripts/check-package-determinism.ts` 和 `check:package-determinism`，避免执行者手工复制覆盖中的包。

- [x] 脚本在两个隔离临时目录分别构建 Chromium ZIP。
- [x] 对两次 ZIP 计算 SHA-256 并要求相同。
- [x] 对 Firefox 未签名上传 ZIP 做同样比较；正式 GitHub Release XPI 仍来自 AMO，不在本地签名。
- [x] 固定归档条目顺序、时间戳、权限和压缩参数。
- [x] 比较归档文件清单和逐文件内容，哈希不同时输出首个差异。
- [x] 临时目录解析到系统临时位置或明确任务目录，完成后安全清理。
- [x] 将此检查纳入 `release:check`，日常 `check` 是否包含可按运行时间决定，但 CI release 必须执行。

### VERIFY-04 包内容审计

对 Chromium ZIP、Firefox 上传 ZIP 和最终 AMO XPI 分别检查：

- [x] 归档根目录直接包含 `manifest.json`。
- [x] manifest version 与候选版本一致。
- [x] Chromium 使用 MV3；Firefox 使用项目规定的 manifest version 和 `strict_min_version: "142.0"`。
- [x] Firefox Gecko id 仍为稳定 id。
- [x] `_locales/en`、`_locales/zh_CN` 文件存在且键集合正确。
- [x] Popup/Options 共享 UI 和目标 adapter 均存在。
- [x] 不包含 `node_modules`、`.git`、`docs/working`、测试 fixture、源映射、临时目录或本地缓存。
- [x] 不包含真实 token、AMO secret、GitHub token、私钥、开发者本机绝对路径或调试日志。
- [x] CSP 和脚本加载不依赖远程代码。
- [x] 文件名大小写在 Windows 和归档内一致。

### VERIFY-05 运行时人工矩阵

| 目标 | locale | 配置 | 页面 | 预期 |
| --- | --- | --- | --- | --- |
| Chromium | zh-CN | 有效 | HTTP(S) | 同步成功、中文状态 |
| Chromium | en-US | 有效 | HTTP(S) | 同步成功、英文状态 |
| Chromium | 两种 | 缺 Token | HTTP(S) | 待配置，不发请求 |
| Chromium | 两种 | 无效 Token | HTTP(S) | 本地化认证错误 |
| Chromium | 两种 | 有效 | 私密窗口 | 不发请求，私密提示 |
| Chromium | 两种 | 有效 | 内部页面 | 不发请求，页面不可同步提示 |
| Firefox | zh-CN | required 同意、optional 拒绝 | HTTP(S) | 核心同步成功，省略技术字段 |
| Firefox | en-US | required 同意、optional 允许 | HTTP(S) | 同步成功，允许技术字段 |
| Firefox | 两种 | 有效 | 私密窗口 | 不发请求 |

- [ ] Chrome/Chromium 实际 build 完成以上矩阵。 — 未完成：真实 Chromium UI 已验证；未连接真实 Patina 完成整张手工矩阵
- [ ] Edge 至少完成 Chromium 包安装、Popup/Options、同步和语言切换 smoke test。 — 未完成：本机没有可用 Edge 安装
- [ ] Firefox 142+ 完成 required/optional data consent 矩阵。 — 未完成：VM 矩阵已通过，真实 consent UI 人工矩阵未执行
- [x] 两种语言各检查一次 Options 与 Popup 的布局、截断和键盘行为。
- [ ] 在 Patina 网页同步关闭时验证本地化 disabled 状态。 — 未完成：409 动态回归已通过，未连接真实 Patina 手工验证
- [ ] 在 Patina 未运行或端口错误时验证本地化 request-failed 状态。 — 未完成：network 动态回归已通过，未做真实进程手工验证

### VERIFY-06 跨仓协议与应用兼容

- [ ] 启动与候选版本兼容的 Patina 主应用。 — 未完成：未启动真实主应用
- [ ] 使用两个浏览器目标发送完整 URL、标题、图标和 `incognito: false`。 — 未完成：VM payload 已验证，未做真实主应用端到端
- [ ] 验证主应用接受 `protocolVersion: 1`。 — 未完成：主应用源码与协议已核对，未做真实进程端到端
- [ ] 验证禁止字段仍不发送。 — 未完成：动态扩展测试已通过，未做真实主应用端到端
- [ ] 验证 URL 的 path、query、fragment 能按现有协议进入本机记录/导出路径。 — 未完成：payload 与主应用协议已核对，未做真实数据库/导出端到端
- [ ] 验证 invalid token、web recording disabled 和未知错误码的前后端语义一致。 — 未完成：源码与动态矩阵已对齐，未做真实进程端到端
- [x] 若没有协议变化，再次确认两仓协议文档哈希相同。

### VERIFY-07 发布前检查

- [x] 执行 `npm run release:check -- <candidate-version>`。
- [x] 检查 Changelog 中候选内容位置符合当前发布事实：未形成正式发布事实时仍在 `[Unreleased]`。
- [x] 检查 release notes 生成只在正式 tag 准备阶段使用正确版本节。
- [x] 检查所有 version、asset name 和 manifest 一致。
- [x] 记录最终本地 ZIP 哈希；AMO XPI 哈希在下载正式 public/listed 资产时记录。

### 阶段 11 退出条件

- [x] VERIFY-01 至 VERIFY-07 全部完成，或外部依赖项被明确标记为未授权而非伪装完成。
- [x] 自动化、人工 UI、隐私、协议、包体和确定性验证均有证据。
- [x] 没有为了让检查通过而扩大例外或降低规则。

## 20. 阶段 12：版本、提交与发布准备

### VERSION-01 选择未占用版本

由于本方案会改变 Popup/Options/后台和打包字节，不能继续复用已经公开的 `0.2.0`。默认建议补丁版本 `0.2.1`，但外部平台事实优先。

- [x] 检查 GitHub tags 和 Releases 中是否已存在 `v0.2.1`。
- [x] 在 AMO Developer Hub 或公共版本 API 检查稳定 Gecko id 已上传、已接受或已签名的最高版本。
- [ ] 在 Chrome Web Store 和 Edge Partner Center 检查是否已有 `0.2.1` 草稿或上传记录。 — 未完成：私有 dashboard 未访问
- [x] 若任一平台已占用 `0.2.1`，统一选择严格更高且符合政策的版本。
- [x] 把选择理由和外部检查时间写入执行证据。
- [x] 不运行 `extension:firefox:sign` 来试探版本是否可用。

### VERSION-02 同步版本事实源

- [x] 更新 `package.json` version。
- [x] 更新 Chromium manifest version。
- [x] 更新 Firefox manifest version。
- [x] 更新 lockfile 中的根 package version。
- [x] 运行 `npm run check:versions -- <candidate-version>`。
- [x] 运行生成器，确认 manifest locale 产物与版本更新没有意外耦合。

### VERSION-03 更新 Changelog

- [x] 实现期间把变化保持在 `[Unreleased]`。
- [x] 至少记录：本地化基础设施、语言无关状态、双目标共享 UI、无障碍、错误矩阵、工具链、不可变发布链、商店记录修复。
- [x] 用户可见描述说结果，不堆内部文件名。
- [ ] 正式 tag 前，在确认发布事实和日期后按政策移动到 `## [<version>] - YYYY-MM-DD`。 — 未完成：尚未授权或形成正式 tag
- [ ] 正式版本节以 `Release:` 摘要开头，满足 `release:notes` 检查。 — 未完成：尚未形成正式版本节
- [x] 不使用 `Closes`、`Fixes` 或 `Resolves`，除非用户明确要求关闭 issue。

### VERSION-04 建议提交拆分

按所有权和可独立审阅行为拆分，实际范围以 diff 为准：

1. `docs: define extension standards alignment contracts`
   - 本地化、工程、架构、发布和协作长期规范。
2. `build: align extension node toolchain`
   - `.node-version`、package、lockfile、CI 工具链检查。
3. `feat(i18n): add deterministic locale generation`
   - schema、registry、review manifest、生成器、自测和生成 locale。
4. `refactor: store language-neutral sync status`
   - 状态码、错误码、迁移和后台分类。
5. `refactor: share browser extension ui`
   - 共享 Popup/Options、平台 adapter 和构建组合。
6. `fix(a11y): complete language menu and live status behavior`
   - 键盘、焦点和 live region。
7. `test: cover runtime failures and browser parity`
   - 错误矩阵、隐私、版本源、parity 和 mutation 证据。
8. `ci: make release assets immutable and verifiable`
   - concurrency、权限、哈希、attestation、预检、恢复、远端回读。
9. `docs: separate store listing from release evidence`
   - Listing、版本记录和陈旧状态检查。
10. `chore: prepare web sync <version>`
    - 仅在版本准备被明确授权和外部版本门通过后创建。

提交规则：

- [ ] 每次 staging 前检查 `git diff --stat` 和文件归属。 — 未完成：未授权 staging/commit
- [ ] 每次 commit 前检查 `git diff --cached --stat` 与 `git diff --cached --numstat`。 — 未完成：未授权 commit
- [ ] 人工维护内容超过 1,000 行变化或 25 个文件时按行为继续拆分；生成文件和新文档可按仓库政策处理，但保持主题清晰。 — 未完成：已给出拆分建议，未授权 commit
- [ ] 生成产物尽量与生成器同提交，或者放入紧邻的独立 mechanical commit；不能出现提交中检查必然失败的状态。 — 未完成：未授权 commit
- [x] issue 引用放在 commit body 的独立 `Refs #N` 段，不放 subject，不自动关闭 issue。
- [x] 用户只说“确认方案”不构成 commit、push、tag 或发布授权。

### VERSION-05 本地交付检查

- [x] 所有计划内文件已实现并验证。
- [x] 没有无关用户改动进入 staged scope。
- [x] 每个建议 commit 可单独说明和审阅。
- [ ] 最终 `npm run check` 和 `release:check` 在最后一个本地 commit 上通过。 — 未完成：最终命令已通过，但未授权创建本地 commit
- [x] 记录尚未授权的外部操作，并停止在本地可审阅状态。

### VERSION-06 远端动作门（仅在明确授权后）

- [ ] 当前任务收到明确 push 目标和范围。 — 未完成：未授权 push
- [ ] 推送前重新确认本地分支、远端和 commit 范围。 — 未完成：未进入 push 门
- [ ] tag 创建/推送有独立明确授权。 — 未完成：未授权 tag
- [ ] tag push 会触发自动 Release 时，授权者已知晓该远端副作用。 — 未完成：未授权 tag
- [ ] GitHub Release 监控只观察已授权触发的运行，不扩大为额外发布操作。 — 未完成：未触发 Release workflow
- [ ] 商店上传、提交审核、公开和分发范围各自有明确授权。 — 未完成：未授权商店操作
- [ ] Firefox 正式 Release XPI 从同版本 AMO public/listed 版本获取，不重新签名。 — 未完成：0.2.1 尚无 AMO public/listed XPI

### 阶段 12 退出条件

- [x] 版本选择基于外部事实而不是本地猜测。
- [x] 本地变更可审阅、可复现、可发布。
- [x] 未授权的远端动作保持未勾选。

## 21. 风险、停止条件与回滚

| 风险 | 早期信号 | 必须停止的条件 | 安全恢复方式 |
| --- | --- | --- | --- |
| 语言源迁移漏键 | UI 空白、显示消息键 | 任一支持 locale 缺必需键 | 修复唯一源并重新生成，不手改目标文件 |
| storage 迁移破坏状态 | 升级后反复迁移或状态丢失 | 迁移非幂等、token 被改写 | 停止发布，修复迁移；只回滚本任务明确文件，不清空用户 storage |
| 服务端原文泄漏 | 未知错误直接显示 message | 原文可能含敏感信息或不可控语言 | 改为通用错误键，诊断字段限长且不展示 |
| 两目标继续漂移 | 只在一个浏览器通过 | 未声明的目标差异 | 修复共享 owner/parity 清单，不加宽泛例外 |
| 生成不确定 | 连续生成有 diff | 同一输入产生不同哈希 | 停止版本准备，固定排序/时间戳/换行 |
| 工具链锁定失败 | 本地和 CI Node 不同 | workflow 绕过 `.node-version` | 修复单一事实源后重新跑全套检查 |
| 发布资产冲突 | 同名远端哈希不同 | 任何正式资产 digest 不一致 | 立即失败；不得覆盖、删除或强推，交由维护者调查版本占用 |
| 发布半完成 | Release 缺部分资产 | 预检无法证明现有资产相同 | 保持现状，修复脚本；只有同哈希时补齐缺失资产 |
| AMO 版本错误 | API 返回非 public/listed 或错误 id | 无法验证版本、哈希或 Gecko id | 不发布 GitHub Release，不重新签名同版本 |
| 商店文档再次过期 | 长期文件出现“审核中” | 状态没有版本记录和日期 | 移到版本化记录并增强检查 |
| 协议意外变化 | 两仓协议哈希不同 | payload/错误语义改变但未评审 | 停止扩展发布，走跨仓协议变更与兼容验收 |
| 工作树混入用户改动 | diff 出现无关文件 | 无法可靠区分归属 | 停止 staging，报告冲突；不得 reset/checkout 用户改动 |

通用回滚规则：

- [x] 不使用 `git reset --hard`、宽泛 `git checkout --` 或递归删除仓库。
- [x] 优先修复当前阶段，使检查恢复；确需回退时只针对本任务明确文件，并先确认没有用户重叠改动。
- [x] 已公开资产发生冲突时不自动删除或覆盖；这是调查事件，不是普通重试。
- [x] 已执行的外部商店操作不能靠本地 Git 回滚，必须按平台事实记录并选择更高版本修复。

## 22. 最终验收清单

### 22.1 规范与架构

- [x] 扩展有适配自身边界的 `docs/localization.md`。
- [x] `AGENTS.md` 包含语言、状态、parity 和明确远端授权规则。
- [x] 架构文档明确 shared UI、platform adapter、目标入口和生成产物 owner。
- [x] 工程质量文档包含 i18n、a11y、runtime matrix、parity 和确定性门禁。
- [x] 发布政策明确内容不可变和安全恢复语义。

### 22.2 语言与状态

- [x] `zh-CN`、`en-US` 有唯一人工维护源。
- [x] `_locales` 和运行时字典确定性生成。
- [ ] review manifest 与当前源哈希一致并有真实审核记录。 — 未完成：哈希一致；维护者 copy approval 待办
- [x] Popup、Options、HTML、ARIA、manifest 和状态错误全部纳入语言契约。
- [x] storage 不保存扩展生成的本地化状态句子。
- [x] 旧 `en` 和 `lastMessage` 数据可幂等迁移。

### 22.3 双目标与无障碍

- [x] Chromium/Firefox 共同 UI 只有一个 owner。
- [x] 平台差异显式且有测试。
- [x] 语言菜单键盘、焦点和 ARIA 行为完整。
- [x] Popup/Options 动态状态可被辅助技术感知。
- [ ] 两目标、两语言人工 smoke test 通过。 — 未完成：Chromium 双目标源可视化与 Firefox 启动 smoke 已完成；Firefox 人工交互待办

### 22.4 测试与工具链

- [x] Node/npm/CI/@types/node 契约一致。
- [x] package scripts 不再使用不必要实验参数。
- [x] i18n 自测证明检查器会抓住缺键、硬编码、过期审核和生成漂移。
- [x] runtime matrix 覆盖成功、关闭、拒绝、HTTP、JSON、网络、隐私和版本。
- [x] 测试不硬编码当前扩展版本。
- [x] `npm run check` 从干净安装通过。

### 22.5 发布与商店

- [x] Release workflow 最小权限、带 concurrency、只构建一次。
- [ ] ZIP/XPI 有 `SHA256SUMS` 和 attestation。 — 未完成：工作流已实现；0.2.1 正式 XPI/证明尚未生成
- [x] 同名不同哈希资产必定失败，不存在 overwrite/clobber。
- [x] 缺失资产只能在现有资产同哈希时补齐。
- [ ] 发布后远端回读验证完整。 — 未完成：工作流已实现；0.2.1 尚未发布
- [x] `STORE_LISTING.md` 不含过期 `0.2.0` 审核中状态。
- [x] `0.2.0` 三商店事实进入版本化记录。
- [x] 商店检查能阻止易腐状态重新进入长期文档。

### 22.6 包体与跨仓

- [x] 两次独立构建哈希一致。
- [x] 包中没有密钥、源码映射、测试 fixture、临时文件或远程代码。
- [x] Firefox optional technical data 拒绝时核心同步继续且省略对应字段。
- [x] Web Activity 协议兼容性通过。
- [x] 无协议变化时两仓协议文档保持字节一致。
- [x] 若发布接受条件改变，两仓长期政策已同步。

## 23. 问题—任务—证据追踪矩阵

| 问题 | 解决任务 | 实际执行证据 |
| --- | --- | --- |
| P-01 本地化规范未同步 | GOV-01、GOV-02、GOV-03 | `docs/localization.md`、`AGENTS.md`、`docs/engineering-quality.md`；`npm run check:i18n` |
| P-02 两目标重复 `OPTIONS_TEXT`/`POPUP_TEXT` | I18N-01、COPY-01、COPY-02、PARITY-01 | `locales/` + `src/shared/ui/`；旧对象搜索无结果；`npm run check:parity` |
| P-03 HTML/ARIA/后台硬编码 | I18N-05、COPY-03、STATE-02 | 生成的默认 locale fallback；`check-hardcoded`；Chromium 147 双语截图人工复核 |
| P-04 storage 保存本地化消息 | STATE-01 至 STATE-05 | `background-status.js` 稳定 code；空/旧/损坏/幂等迁移 VM 矩阵 |
| P-05 `_locales` 重复且覆盖不足 | I18N-03、COPY-04 | 连续两次生成零漂移；两个 manifest 与 locale build check |
| P-06 缺少语言工程门禁 | I18N-01 至 I18N-07 | `check:i18n:self-test` 缺键/未知键/参数/硬编码/stale/hash/fallback 负例 |
| P-07 语言菜单键盘缺口 | A11Y-01、A11Y-04、A11Y-05 | jsdom 双目标事件矩阵；Chromium 147 实际焦点恢复与 reflow 验收 |
| P-08 Popup 状态不可播报 | A11Y-02、A11Y-04 | 双目标 DOM 断言 `role=status` / polite / atomic；真实浏览器双语视觉验收 |
| P-09 没有双目标 parity gate | PARITY-01 至 PARITY-05 | 带理由的允许差异 map；17 文件 parity；键盘/live mutation 自测 |
| P-10 工具链漂移 | TOOL-01 至 TOOL-05 | `.node-version` + exact engines/devEngines；`check:toolchain`；两个 workflow 同源 |
| P-11 运行时只测成功 | TEST-01、TEST-02、TEST-06 | 两目标成功/409 disabled/拒绝/JSON/401/403/500/network/隐私/消息回调矩阵 |
| P-12 测试硬编码版本 | TEST-03 | package/manifests 动态读取；`release:check -- 9.9.9` 预期失败 |
| P-13 Release 可覆盖 | GOV-04、RELEASE-04、RELEASE-05 | 无 overwrite/clobber；同名冲突、计划外近似资产、缺失与同哈希纯函数用例 |
| P-14 Release 证据和恢复不足 | RELEASE-01 至 RELEASE-07 | 最小权限、concurrency、SHA256SUMS、attestation verify、metadata/远端 manifest 回读门 |
| P-15 商店状态陈旧 | STORE-01、STORE-02、STORE-03 | `docs/store-releases/0.2.0.md`；AMO public XPI 实算哈希与 API hash 一致 |
| P-16 检查发现不了陈旧状态 | STORE-04、STORE-05 | `check:store-assets` 拦截动态审核短语、固定候选版本、过期路径与证据缺项 |
| P-17 push 授权规则简略 | GOV-02 | `AGENTS.md` 明确 commit/push/tag/Release/签名/商店独立授权矩阵 |
| P-18 跨仓发布契约不一致 | GOV-04、RELEASE-08 | 两仓 release policy 同窗口更新；协议文档 SHA-256 均为 `F480AB...101B3` |
| P-19 `release:check -- version` 参数被命令链吞掉 | VERSION-02、VERIFY-07 | `scripts/release-check.ts` 显式透传；`9.9.9` 负例失败，`0.2.1` 全链通过 |
| P-20 英文长错误在窄视口撑破 Options 卡片 | A11Y-03、A11Y-05 | shared CSS 解除隐式最小宽度并允许状态换行；Chromium 147 400px 前后截图复核 |
| P-21 Patina HTTP 409 disabled 被误分类 | STATE-02、TEST-02、VERIFY-06 | 分类器优先识别已验证 stable body；双目标 409 动态回归；两仓协议同步说明 |
| P-22 最新开发工具链存在无上游修复的 audit 告警 | TOOL-01、VERIFY-02 | runtime audit 0；开发期 `web-ext -> addons-linter -> image-size` 限定例外与升级触发规则 |

- [x] 每一行都已填入实际提交或命令证据。
- [x] 没有以“由别的任务顺带覆盖”为由跳过验证。
- [x] 若执行中发现新问题，为其增加 `P-xx`、负责人、任务和证据，而不是只写在聊天或 commit message 中。

## 24. 执行记录模板

每个阶段结束后追加一条记录：

```text
阶段：
完成日期：
执行者：
相关提交：
主要文件：
执行命令：
自动验证摘要：
人工验证环境与结果：
产物 SHA-256：
已知剩余项：
是否涉及未授权外部动作：
```

最终汇总：

- 最终本地提交：`未创建；当前任务未授权 commit`
- 最终候选版本：`0.2.1`
- Chromium ZIP：`dist/extensions/chromium/patina-chromium-extension-v0.2.1.zip`
- Chromium SHA-256：`31BF0C64EAB3AEE56F855F12BA2638CE9A448A3E3C89804BEE5DD00786487BB2`
- Firefox 本地未签名上传 ZIP：`dist/extensions/firefox/patina-firefox-extension-v0.2.1.zip`
- Firefox 本地未签名 ZIP SHA-256：`8B8183C97D8F3B7246F0614BD8BEDB4772E1FB20C084DD1D0D22FD9BEACA4D39`
- Firefox AMO listed XPI：`0.2.1 尚未上传/签名；0.2.0 public XPI 证据见 docs/store-releases/0.2.0.md`
- `SHA256SUMS` SHA-256：`未生成正式值；缺少同版本 AMO public/listed XPI，工作流将基于最终 ZIP/XPI 生成`
- GitHub Actions run：`未触发；无 tag/push 授权`
- Chrome Web Store 状态：`0.2.0 公开；0.2.1 未上传，私有 draft 占用未核验`
- Firefox AMO 状态：`0.2.0 public/listed；0.2.1 未上传`
- Microsoft Edge Add-ons 状态：`0.2.0 公开页可访问；0.2.1 未上传，私有 draft 占用未核验`

## 25. 归档条件

- [x] 第 22 节仓库内验收全部完成。
- [x] 第 23 节每个已知问题都有实现和证据。
- [x] 未授权外部动作清楚保留为未完成，不用措辞暗示已经发布。
- [x] 在文档顶部把状态改为“仓库内完成”或“全部完成”，并写最终结论。
- [x] 将本文移到 `docs/archive/2026-08-09-standards-alignment-execution-plan.md`。
- [x] 顶层长期文档已经承接所有持续有效的规则；归档本文后不会丢失长期约束。
