# 版本与发布策略

## 版本来源

Patina Web Sync 是公开 GitHub 仓库，但目前不发布为 npm 包。除非 npm 发布成为明确目标，否则保持 `package.json` 的 `"private": true`。

项目版本应在以下来源中保持一致。`npm run check:versions` 会在本地和 CI 中强制检查：

- `package.json` 的 `version`
- `src/chromium/manifest.json` 的 `version`
- `src/firefox/manifest.json` 的 `version`
- Git tag `vX.Y.Z`
- GitHub Release 标题 `Patina Web Sync vX.Y.Z`

独立仓库初始版本为 `0.1.1`，它在迁仓时统一了 Chromium 与 Firefox 版本。浏览器扩展版本使用数字 `X.Y.Z` 或 `X.Y.Z.N` 格式。

## Changelog 规则

`CHANGELOG.md` 是发布说明，不是提交清单、迁移清单或仓库维护日志。

默认只记录相对上一个已发布版本的最终结果：

- 用户能感知的安装、权限、协议、浏览器支持、兼容性或使用体验变化。
- 影响发布判断、签名、打包、版本一致性或发布附件的内部变化。
- 已经进入正式发布结果的新增、变更、修复或移除。

默认不记录：

- `AGENTS.md`、本地 `.agents/skills/`、`.gitignore`、编辑器配置或个人工作区文件调整。
- 长期文档整理、中文化、归档移动、README 索引维护等不改变扩展行为或发布资产的文档卫生变化。
- 开发过程中出现过但最终没有进入发布结果的中间尝试、回退或一次性操作步骤。

推荐分类保持为 `Added`、`Changed`、`Fixed`、`Removed`、`Internal`，与 Patina 主仓库结构一致。其中 `Internal` 只写少量对发布理解有帮助的工程、验证或发布流程变化，不要把提交清单搬进 changelog。

`CHANGELOG.md` 的摘要和条目正文默认使用中文。命令、文件名、字段名、版本号、浏览器商店官方名称、扩展 manifest 等没有合适中文替代的技术名词可以保留英文，但不要写整句英文发布条目。

每个正式版本节应包含 `Release:` 摘要。Patina Web Sync 没有应用内更新弹窗，因此不需要复制 Patina 主仓库的 `App note:` 字段。

候选版本、商店准备版本或已经更新版本文件但尚未对外发布的内容，必须继续留在 `[Unreleased]` 下。只有对应 Git tag、GitHub Release 或浏览器商店发布事实已经形成后，才把内容移动到带版本号和日期的正式版本节，例如 `## [0.2.0] - 2026-07-05`。

## 浏览器版本规则

Chromium 和 Firefox manifest version 通常应一起前进。如果浏览器专属紧急情况要求只发布某个目标，打 tag 前先在 `CHANGELOG.md` 中记录原因。

Firefox 版本需要额外谨慎。同一个稳定 Gecko id `web-sync@patina.local` 一旦签名过某个版本，不要回退该 manifest version。

真正上传 AMO listed submission 或运行任何签名流程前，必须在 AMO Developer Hub 检查该稳定 Gecko id 已接受、已上传或已签名的最高版本。目标 manifest version 必须严格更高；本地 tag 或 changelog 不能替代这一外部事实检查。Chrome Web Store 和 Edge Partner Center 也要检查同版本草稿或上传记录，避免在包内容仍变化时占用版本。

不要为了验证迁移、普通文档变更、listed 商店发布或 GitHub Release 而运行 `npm run extension:firefox:sign`。该命令只用于明确的 unlisted 测试，并且仍需先确认目标版本严格向前移动。

## 浏览器商店提交

浏览器商店提交准备遵循 `docs/store-submission.md`。Chrome Web Store、Firefox AMO 和 Microsoft Edge Add-ons 的商店页文案、隐私政策、审核说明、素材与扩展包行为必须保持一致。

Firefox AMO 公开上架提交与本仓库的未公开测试签名辅助流程是不同流程。准备 AMO 公开上架时，默认使用 AMO 提交页面选择 `On this site` 并让 AMO validator 检查上传包；不要把 `npm run extension:firefox:sign` 当作 AMO 公开上架或 GitHub Release 的步骤。

Listed 与 unlisted 共享稳定 Gecko id 的版本历史；任一路径已接受或签名的版本都视为已占用。不得在另一条路径重复使用相同 version。Firefox 142+ 的 built-in data consent、最低版本和数据类别也属于发布候选的一部分，修改后必须前进版本并重新走 validator。

## 验证

默认验证：

```bash
npm run check
```

准备发布附件前，还要运行：

```bash
npm run release:check
```

`npm run release:check` 会生成本地 Chromium 包和未签名 Firefox 开发包。它不会执行 AMO 签名。

两个 zip 的根目录必须直接包含 `manifest.json`。额外的版本命名父目录会使商店 validator 无法识别扩展，属于发布阻塞问题。

## 发布附件

Chromium 发布附件：

```text
patina-chromium-extension-vX.Y.Z.zip
```

Firefox 发布附件：

```text
patina-firefox-extension-vX.Y.Z.xpi
```

正式发布中的 Firefox `.xpi` 必须由 AMO 签名产出。未签名 Firefox zip 只是开发产物，不应作为面向用户的发布附件。

GitHub Release 使用 AMO 已公开的同版本 listed XPI。发布工作流必须通过 AMO 公开版本 API 获取下载地址和 SHA-256，确认版本渠道为 `listed`、文件状态为 `public`，校验下载文件哈希、manifest version 和稳定 Gecko id 后再收集附件。不得对已经上传或发布到 AMO 的版本再次执行 unlisted 签名。

GitHub Release 正文必须由 `CHANGELOG.md` 对应正式版本节生成。工作流重跑时允许复用同 tag 的现有 Release，覆盖同名附件并刷新正文，以修复首次发布中断留下的草稿或不完整附件；重跑不得重新签名 Firefox。

## 发布流程

1. 更新 `CHANGELOG.md`。
2. 确认 `package.json` 和两个浏览器 manifest 都使用目标版本。
3. 运行 `npm run check`。
4. 运行 `npm run release:check` 做本地打包验证。
5. 提交发布候选，并把该提交生成的对应包分别提交到 Chrome Web Store、Firefox Add-ons 和 Microsoft Edge Add-ons。
6. 等待三个商店中的同一版本全部审核通过并公开。审核期间不要用相同版本重新生成内容不同的上传包。
7. 维护者确认三个商店全部通过后，再为发布候选提交创建并推送 tag `vX.Y.Z`。
8. Tag push 自动触发 `Publish Release`：GitHub Actions 校验版本一致性、打包 Chromium、从 AMO 下载同版本公开 listed XPI，校验 AMO SHA-256、manifest version 和稳定 Gecko id，然后一次性发布完整 GitHub Release。

`Publish Release` 不提供人工触发入口，也不持有 AMO 签名凭据。若维护者过早推送 tag，AMO API 尚未返回该版本的公开 listed XPI，工作流必须在创建 GitHub Release 前失败。若同 tag GitHub Release 已存在，工作流复用它并刷新经过验证的正文与同版本附件。

## Patina Web Sync 跨仓签收契约

一个 Patina Web Sync 版本只有同时满足以下条件，才视为完成跨仓发布签收：

1. 发布候选源码已经固定，`package.json` 与两个 manifest 使用同一版本。
2. 同一版本已在 Chrome Web Store、Firefox Add-ons 和 Microsoft Edge Add-ons 全部审核通过并公开。
3. 维护者确认三店状态后，为对应发布候选提交创建并推送 `vX.Y.Z` tag。
4. Tag 自动工作流已经发布完整的 Patina Web Sync GitHub Release，tag、Release 标题与附件版本一致。
5. Firefox Release 附件来自 AMO 的同版本公开 listed XPI，并已校验 AMO SHA-256、manifest version 与稳定 Gecko id。
6. 若版本改变 Web Activity 协议，Patina 接收端兼容必须先落地，两仓的 `docs/web-activity-protocol.md` 必须保持一致。

完成签收不绑定两个项目的版本号，也不要求 Patina 与 Patina Web Sync 同日发布。Patina Release 不携带扩展附件；Patina 只消费稳定商店入口、扩展 Release 和双方已对齐的本机协议。普通扩展发布不得依赖尚未发布的 Patina 接收端行为。

## 与 Patina 发布的关系

Patina 桌面发布不打包或上传 Patina Web Sync 浏览器扩展附件。

Patina README 和 Patina Settings 可以链接到本仓库发布页或未来浏览器商店入口。除非协议兼容性变化需要协调，否则扩展发布节奏应独立于 Patina 桌面应用。
