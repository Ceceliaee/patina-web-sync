# 浏览器商店提交参考

## 目的与当前边界

本文是 Patina Web Sync 在 Chrome Web Store、Firefox AMO 和 Microsoft Edge Add-ons 提交时的长期参考。

截至 2026 年 7 月 11 日，三个商店的开发者账号均已注册并可用。Firefox AMO 与 Microsoft Edge Add-ons 已提交 `0.2.0` 并等待审核；Chrome Web Store 尚未提交。账号就绪不代表扩展已上传、通过审核或发布。仓库准备默认只完成包、文案、隐私政策、审核说明、素材和 go / no-go 证据；真实上传、提交审核、发布或分发范围选择是单独的外部操作，需要用户明确执行或授权。

候选版本是 `0.2.0`。它发送当前非私密活动页面的完整 URL（包括 path、query 和 fragment），使 Patina 可以保存并导出“URL 地址”；不再发送 tab/window ID、采集时间或事件原因。Firefox 最低版本为 142.0，并使用内置数据同意。

## 唯一事实来源

- 中英文 listing、字段对照、权限理由和数据分类：根目录 `STORE_LISTING.md`。
- 共用隐私政策：根目录 `PRIVACY.md`。
- 审核员步骤：`docs/store-reviewer-test-instructions.md`。
- 运行时 payload：`docs/web-activity-protocol.md` 和两个目标的 `background.js`。
- 上传素材：`store-assets/<store>/`；`store-assets/source/` 不直接上传。
- 版本与签名规则：`docs/versioning-and-release-policy.md`。

三个后台不得现场创造与上述来源冲突的事实。平台必须使用不同字段名时，只转换格式，不改变含义。

## 商店文案隔离规则

- 面向用户的商店名称、短描述和详细描述只能描述当前提交的构建，不得提及或对比其他浏览器、其他扩展商店。
- 共用描述保持平台中立；平台特有的权限或兼容性事实放到该平台专属字段、隐私表单或审核员说明。
- 粘贴公开描述前，必须搜索 `Chrome`、`Edge`、`Firefox`、`Safari` 和商店名称。除非平台要求且名称指向当前目标，否则必须移除匹配项。
- 审核员说明也优先使用当前平台术语；测试内部页面时只写当前平台的内部 URL。

## 提交前版本门

1. 读取 `package.json` 和两个 manifest，确认版本一致。
2. 查看本地 Git tag 和 GitHub Release。
3. 在 AMO Developer Hub 检查稳定 Gecko ID `web-sync@patina.local` 已接受、签名或上传的最高版本。
4. 检查 Chrome Web Store 和 Edge Partner Center 是否已有同版本草稿或上传记录。
5. 只有 `0.2.0` 未被相关平台占用时，才可继续上传该版本；否则先把三处版本统一前进。
6. 运行 `npm run check` 和 `npm run release:check`。

不得为了验证文档、manifest 或本地包而运行 `npm run extension:firefox:sign`。

## 共用隐私与产品事实

- 单一用途：为本机 Patina 自动补充当前非私密活动网站的时间记录上下文。
- 依赖：同一台 Windows 电脑上的免费 Patina 桌面应用。
- 鉴权：Patina Settings 生成的本机端口和 bearer token。
- 网络：只允许 `127.0.0.1` 和 `localhost`。
- 数据：完整页面 URL、页面标题、网站图标信息和 `incognito: false`；Chromium 还发送本机技术字段，Firefox 只在可选同意后发送这些字段。
- 完整 URL 的 query 可能包含搜索词或其他用户输入，因此三平台数据声明必须披露 browsing activity / web history 与 search terms。
- 不处理：正文、表单值、密码、Cookie、截图、剪贴板、下载历史和浏览器历史数据库。
- 私密窗口：在 favicon 解析和 payload 构造之前跳过。
- 无账号、云同步、广告、分析、远程代码、付费功能或第三方数据接收方。

共用公开隐私政策 URL：

```text
https://github.com/Ceceliaee/patina-web-sync/blob/main/PRIVACY.md
```

支持 URL：

```text
https://github.com/Ceceliaee/patina-web-sync/issues
```

## 多语言规则

Chromium 包必须包含 `default_locale: "en"`、`_locales/en/messages.json` 和 `_locales/zh_CN/messages.json`，manifest name / description 必须使用 `__MSG_...__`。这让 Chrome 和 Edge 后台能够建立英语与简体中文 localized listing。

Firefox 包也携带相同 manifest locale；AMO 商店页翻译仍需在 AMO 后台单独填写。包内 locale 不会自动替代 AMO listing 翻译。

## Firefox 数据同意

Firefox 142+ 的 manifest 必须保持：

- required：`authenticationInfo`、`browsingActivity`、`searchTerms`、`websiteContent`。
- optional：`technicalAndInteraction`。
- `technicalAndInteraction` 不得进入 required。
- 用户拒绝 optional 后，核心网站同步必须继续工作，payload 必须省略 browser client id、browser kind 和 extension version。
- Gecko ID 必须保持 `web-sync@patina.local`。

Firefox Desktop 140 已支持内置同意，但 Firefox Android 到 142 才支持。当前包采用保守的 142 最低版本，使 AMO compatibility validator 在未声明 Android target 时也保持无警告，并避免维护重复的旧版自定义同意 UI。

## Chrome Web Store

提交前：

1. 生成并上传 `dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip`。
2. 确认 zip 根目录直接包含 `manifest.json`。
3. 从 `STORE_LISTING.md` 填写英语和简体中文 listing。
4. 上传 `store-assets/chrome-web-store/` 中明确列出的 icon、截图和 small promo tile。
5. 在 Privacy practices 填写单一用途、每项权限理由、数据类别、No remote code 和共用隐私政策 URL。
6. 根据实际目标单独选择地区与公开范围；首次审核在后台提供时优先 deferred publishing。
7. 如果 validator 提到权限、隐私、远程代码或 package 根目录，停止提交并修复，不接受带警告发布。

## Firefox AMO

公开上架流程：

1. 选择 `On this site`，作为 listed add-on。
2. 上传 `dist/extensions/firefox/patina-firefox-extension-vX.Y.Z.zip` 让 AMO validator 检查。
3. 确认上传版本严格高于 AMO 对稳定 Gecko ID 已接受的最高版本。
4. 填写英语与简体中文 summary / description、MIT、No experimental、No payment，以及共用隐私政策和审核说明。分类优先选 `Productivity`；若 AMO 当前分类列表没有该项，则选择 `No suitable category` 并记录实际选择。
5. 确认 Firefox 142+ built-in consent 显示 required / optional 数据类型。
6. 当前源码不压缩、不混淆、不 bundle。AMO 要求源码时，提供仓库源码和 `npm ci`、`npm run extension:firefox:package` 可复现命令，不提交 secrets 或生成目录。

本仓库的 `extension:firefox:sign` 是未公开签名辅助流程，不能代替 AMO listed submission。

## Microsoft Edge Add-ons

1. 默认上传已经通过检查的 Chromium-family zip；只有 Edge validator 提出稳定差异时才建立 Edge 专属 target。
2. 从 `STORE_LISTING.md` 填写英语与简体中文 listing；每种语言的详细描述需保持 250–10,000 字符。
3. 上传 `store-assets/edge-add-ons/extension-logo-300.png` 和 `store-assets/edge-add-ons/small-promo-tile.png`，并分别应用到英语和简体中文 listing。
4. 首发截图保持省略，只要后台仍将其标记为可选。未来若上传，必须在 Edge 中捕获，不得用 Chrome 浏览器外观冒充。
5. Privacy 如实选择会访问 / 传输信息，逐项填写权限理由、数据用途、No remote code、共用政策 URL、项目 URL 和支持入口。
6. 账号国家/地区不自动决定扩展 availability；市场与公开范围需在提交时单独确认。

## 自动验证与包审计

提交前运行：

```bash
npm run check
npm run release:check
```

检查生成包：

- zip 根目录直接包含 `manifest.json`，没有版本命名的额外父目录。
- 只包含构建脚本 allowlist 中的扩展文件。
- 包含英语和简体中文 `_locales`。
- 不包含 `.secrets`、`node_modules`、`dist`、source screenshots 或其他发布产物。
- 没有远程 host permission、content scripts、远程代码或未声明权限。
- `npm run check:store-assets` 验证平台图片尺寸、数量和文档路径。

## 上传后的证据

每个平台真实上传后记录：上传版本、package hash、validator 结果、listing locale、privacy 选择、素材集合、提交时间和当前状态。后台截图可作为一次性证据，但稳定规则应回写本文或其他长期文档，不能只存在截图中。

### `0.2.0` 实际提交记录

| 平台 | 包与 SHA-256 | 校验与公开资料 | 提交标识 | 2026-07-11 状态 |
| --- | --- | --- | --- | --- |
| Firefox AMO | `patina-firefox-extension-v0.2.0.zip`; `D935B77D6AA2FA9599A0DEA7AC44336DA29EDBF7B23F25C6F4757F2A4AC53038` | AMO 自动验证无错误或警告；Desktop；英语与简体中文；MIT；`No suitable category`；listed on this site | Version ID `6349117` | 已提交，等待 AMO 审核 |
| Microsoft Edge Add-ons | `patina-chromium-extension-v0.2.0.zip`; `EBD361E597D893C336838DF8D5E995FD4428FE3758B2F65A45BAB20054F227C5` | 包验证通过；Public；241/241 markets 并启用未来市场；英语与简体中文；logo 与 small promotional tile；隐私与权限声明完成 | Product/draft ID `1c97f45f-593b-4d9b-a75e-67e8d46e1e25` | `In review`，后台预计 7 个工作日内反馈 |
| Chrome Web Store | 计划使用同一 Chromium 包与 SHA-256 | 英语与简体中文文案、隐私资料、icon、截图、small promo tile 已在仓库准备 | 尚无提交标识 | 尚未提交；需在 Chrome Web Store Developer Dashboard 完成人工后台操作 |

Edge `0.2.0` 的公开英文和中文描述均未提及其他浏览器。审核说明也仅使用当前平台术语。
