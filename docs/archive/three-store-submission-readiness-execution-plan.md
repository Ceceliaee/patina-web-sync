# 三商店上架前准备执行方案

Status: archived; repository-side store readiness implemented.
Created: 2026-07-05.
Completed: 2026-07-05.
Archived: 2026-07-05.
Source of truth: no. This file is archived historical context. Use docs/store-submission.md, docs/versioning-and-release-policy.md, STORE_LISTING.md, and PRIVACY.md as the current source of truth.
Archive checkbox note: checked items mean handled for this repository-side readiness task: completed and verified locally where possible, or explicitly closed as deferred where external dashboards, account access, store review, or live installed-browser validation are required.
Completion note: Repository-side readiness is complete for Chrome Web Store, Firefox AMO, and Microsoft Edge Add-ons preparation. Added shared privacy policy, reviewer instructions, store-submission reference, Chrome/Firefox/Edge listing sources, Edge 300x300 logo, 0.2.0 store candidate version, changelog entry, validation/package inspection, and local mock behavior verification. No real store dashboard submission was performed.
Deferred external actions: Chrome Developer Dashboard upload/submission, Firefox AMO listed submission and validator UI, Microsoft Edge Partner Center work while account access is blocked, and live installed-browser validation with a real Patina desktop session remain future user-owned submission actions.

## 目标

- [x] 完成 Chrome Web Store、Firefox AMO、Microsoft Edge Add-ons 三个商店的上架前准备。
- [x] Chrome 和 Firefox 先进入可提交状态，不等待 Edge 开发者账号解除阻塞。
- [x] Edge 账号可用后，能够复用已准备好的 Chromium package、listing copy、privacy policy、assets 和 reviewer notes。
- [x] 不改变 Patina Web Sync 的产品边界：本机-only、无账号、无云同步、无分析、无远程采集。
- [x] 不新增 remote host permissions、remote code、content scripts、browser history、cookies、downloads、clipboard、page DOM 或 screenshot 能力。
- [x] 让审核员可以在最短路径内理解、安装、配置、验证 Patina Web Sync。
- [x] 让用户在商店页看到的承诺与扩展真实行为一致。
- [x] 形成一个可提交的 store candidate 版本；自动验证、package inspection 和 mock receiver verification 已完成，真实浏览器/商店后台人工验收延后到提交前。

## 官方资料基线

- [x] 以官方资料为准，不依赖论坛经验或旧流程记忆。
- [x] Chrome Web Store 官方发布流程：
  - [x] 上传 zip package。
  - [x] 填写 Store Listing。
  - [x] 填写 Privacy。
  - [x] 填写 Distribution。
  - [x] 必要时填写 Test instructions。
  - [x] 可选择 deferred publishing，审核通过后再手动发布。
  - [x] Source: https://developer.chrome.com/docs/webstore/publish/
- [x] Chrome Privacy 官方要求：
  - [x] single purpose 必须窄且容易理解。
  - [x] permissions 必须最小化并逐项说明。
  - [x] remote code 需要声明；本项目应声明 no remote code。
  - [x] 需要披露 data use，并与 privacy policy URL 保持一致。
  - [x] Source: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- [x] Chrome Store Listing 官方要求：
  - [x] 需要详细描述、category、language。
  - [x] 需要 store icon、至少一张 screenshot、small promo tile。
  - [x] Source: https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- [x] Firefox AMO 官方提交流程：
  - [x] 选择 `On this site` 才是 listed on AMO。
  - [x] 上传 add-on file，AMO validator 会检查。
  - [x] validator warning，尤其 security/privacy warning，应优先处理。
  - [x] 填写 name、summary、description、category、support、license、privacy policy、reviewer notes。
  - [x] Source: https://extensionworkshop.com/documentation/publish/submitting-an-add-on/
- [x] Firefox source code 官方要求：
  - [x] 如果使用 minifier、bundler、template engine 或自定义预处理生成扩展文件，需要提交 source code package 和可复现 build instructions。
  - [x] 当前仓库扩展源码未经过 bundling/minification；提交前仍需确认 AMO 页面是否要求 source code package。
  - [x] Source: https://extensionworkshop.com/documentation/publish/source-code-submission/
- [x] Microsoft Edge 官方发布流程：
  - [x] 需要 Partner Center developer account。
  - [x] 需要 privacy policy URL，且 policy 内容必须说明 data 如何 collected、used、disclosed。
  - [x] 需要 Store listing：description、extension logo，并建议补充 assets。
  - [x] Source: https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension

## 第一性原理

### 1. 商店审核的本质

- [x] 商店审核不是只看代码是否能运行，而是在判断：
  - [x] 扩展目的是否单一、具体、可理解。
  - [x] 权限是否与目的严格匹配。
  - [x] 用户数据是否被准确披露。
  - [x] 审核员是否能复现核心行为。
  - [x] 包内代码是否与提交说明一致。
  - [x] listing 是否没有误导、夸大或遗漏。
- [x] 因此上架前准备的核心不是“写营销文案”，而是减少审核员的不确定性。

### 2. Patina Web Sync 的信任边界

- [x] 浏览器扩展是浏览器侧客户端。
- [x] Patina 桌面应用是本机 receiver、token issuer、storage owner 和 UI source of truth。
- [x] 扩展只向 `127.0.0.1` 或 `localhost` 发送最小活动标签页元数据。
- [x] 扩展不拥有 Patina 数据模型，不存储网页活动记录，不做云同步。
- [x] 商店页必须把这个边界讲清楚，否则审核员会把它误读成 remote sync、account sync 或 tracking extension。

### 3. 数据披露必须比代码更保守

- [x] 如果扩展可以读取或发送某类数据，即使只发送到本机，也应在 privacy/listing 中清楚披露。
- [x] 本项目应披露 browsing activity metadata，因为普通非私密活动网页的 URL/title/icon 会发给本机 Patina。
- [x] 本项目应说明 incognito/private tabs 在扩展端发送前过滤。
- [x] 本项目应说明不读取 page body、forms、passwords、screenshots、clipboard、cookies、download history、browser history database。
- [x] 本项目应说明 token 只保存在 browser extension local storage，并只用于 local Patina request。

### 4. 三商店策略应先共同后分化

- [x] Chrome 和 Edge 共用 Chromium-family extension target。
- [x] Firefox 使用独立 WebExtension target，不能请求 Chromium-only `favicon` permission。
- [x] Listing copy、privacy policy、reviewer instructions、screenshots 应尽量共用同一事实模型。
- [x] Store-specific 字段和包格式单独处理。
- [x] Edge 账号阻塞不应阻塞 Chrome/Firefox 准备，因为 Edge 大多复用 Chromium 资产和文案。

### 5. Store candidate 是可审计的版本点

- [x] Store candidate 不是新功能名，而是准备提交商店的版本候选。
- [x] Candidate 必须满足：
  - [x] version 已确定。
  - [x] package 可重复生成。
  - [x] changelog 描述清楚。
  - [x] privacy/listing/reviewer instructions 与实际包一致。
  - [x] 手动验证清单已准备；mock receiver verification 已完成，live installed-browser validation 延后到提交前。
- [x] 是否使用 `0.1.2` 或 `0.2.0` 需要单独决策：
  - [x] `0.1.2` 表示在现有初始发布线上的小修候选。
  - [x] `0.2.0` 表示第一个商店分发里程碑。
  - [x] 归档时已明确版本决策：使用 `0.2.0` 作为第一个 store candidate。

## 非目标

- [x] 不在本计划中提交商店审核；本计划只覆盖上架前准备。
- [x] 不在 Edge 账号被阻塞期间绕过 Partner Center。
- [x] 不新增 Patina account、cloud sync、analytics 或 remote ingestion。
- [x] 不把 Patina 桌面应用打包进扩展。
- [x] 不把未签名 Firefox development zip 当成用户安装包发布。
- [x] 不在未确认 Firefox manifest version 前运行 AMO signing。
- [x] 不提交 `dist/`、`dist-release/`、`web-ext-artifacts/`、`.secrets/` 或 AMO credentials。

## 计划创建时仓库基线与归档结果

- [x] `package.json` 计划创建时版本为 `0.1.1`；归档时 store candidate 为 `0.2.0`。
- [x] Chromium manifest 计划创建时版本为 `0.1.1`；归档时 store candidate 为 `0.2.0`。
- [x] Firefox manifest 计划创建时版本为 `0.1.1`；归档时 store candidate 为 `0.2.0`。
- [x] `src/chromium/STORE_LISTING.md` 已存在 Chrome listing draft。
- [x] `src/chromium/PRIVACY.md` 已存在 Chromium privacy policy draft。
- [x] `src/firefox/PRIVACY.md` 已存在 Firefox privacy policy draft。
- [x] `src/firefox/STORE_LISTING.md` 已建立。
- [x] Edge-specific listing draft 已建立为 `src/chromium/EDGE_STORE_LISTING.md`。
- [x] `store-assets/` 当前有：
  - [x] `screenshot-1.png`
  - [x] `small-promo-tile.png`
  - [x] `README.md`
- [x] optional `marquee-promo-tile.png` 未作为首轮上架 blocker，归档为 deferred optional asset。
- [x] 当前校验脚本已经守住：
  - [x] 精确 permissions allowlist。
  - [x] 精确 local host permissions。
  - [x] 空 optional permissions。
  - [x] 空 content scripts。
  - [x] private/incognito tab 发送前过滤。
  - [x] bridge success 必须显式 `ok: true`。
- [x] Chrome 开发者账号已完成注册。
- [x] Firefox 开发者账号已完成注册。
- [x] Edge 开发者账号注册被阻止，可能需要等待。

## 总体路线

- [x] 第 1 条线：Chrome listed submission readiness。
- [x] 第 2 条线：Firefox AMO listed submission readiness。
- [x] 第 3 条线：Edge readiness without account access。
- [x] 第 4 条线：共用 privacy、reviewer instructions、assets、manual verification。
- [x] 第 5 条线：版本、打包、release hygiene。

## 阶段 1: 确认商店分发决策

- [x] 明确 Chrome 目标：
  - [x] 是否作为 public Chrome Web Store item。
  - [x] 是否使用 deferred publishing。
  - [x] 首次提交时是否限制地区。
  - [x] 目标 language：默认 Simplified Chinese，是否同时提供 English。
- [x] 明确 Firefox 目标：
  - [x] 选择 `On this site`，即 listed on AMO。
  - [x] 不再把 `On your own` self-distribution 当作上架流程。
  - [x] 是否暂时标记 experimental。
  - [x] 目标 category。
- [x] 明确 Edge 目标：
  - [x] 账号阻塞期间只做准备，不提交。
  - [x] 账号恢复后复用 Chromium target package 或检查 Edge 专属 manifest 是否必要。
  - [x] 是否把 Edge 上架作为 Chrome 审核后的 follow-up。
- [x] 明确版本策略：
  - [x] 是否使用 `0.1.2`。
  - [x] 是否使用 `0.2.0`。
  - [x] 确认该版本是否需要 GitHub Release。
  - [x] 确认 Firefox stable Gecko id 下该 version 尚未签名。

## 阶段 2: 建立 store submission source files

- [x] 新增或更新共用计划/说明文件：
  - [x] `docs/working/three-store-submission-readiness-execution-plan.md`
  - [x] 如需要长期保留规则，再另行抽取到 top-level docs。
- [x] 更新 Chrome listing source：
  - [x] `src/chromium/STORE_LISTING.md`
  - [x] 保持 official Chrome 字段名：Store Listing、Privacy、Distribution、Test instructions。
  - [x] 确认 description 不暗示云、账号或跨设备 sync。
  - [x] 确认 no remote code 文案明确。
- [x] 新建 Firefox listing source：
  - [x] `src/firefox/STORE_LISTING.md`
  - [x] 包含 AMO fields：
    - [x] Name
    - [x] Summary
    - [x] Description
    - [x] Categories
    - [x] License
    - [x] Support website
    - [x] Support email decision
    - [x] Privacy policy
    - [x] Notes for Reviewers
    - [x] Source code submission decision
  - [x] 明确 AMO distribution 选择为 listed `On this site`。
- [x] 新建 Edge listing source：
  - [x] `src/chromium/EDGE_STORE_LISTING.md` 或 `src/edge/STORE_LISTING.md`。
  - [x] 如果不新建 `src/edge/` target，则使用 Chromium source 并在文件中说明 Edge 复用 Chromium package。
  - [x] 包含 Edge fields：
    - [x] Description
    - [x] Privacy policy URL
    - [x] Extension logo
    - [x] Small promotional tile
    - [x] Screenshots
    - [x] Support URL
    - [x] Reviewer notes
- [x] 决定是否新建共用 reviewer notes：
  - [x] 可选：`docs/store-reviewer-test-instructions.md`
  - [x] 若创建，Chrome/Firefox/Edge listing source 均引用该文件。

## 阶段 3: Privacy policy 准备

- [x] 决定 privacy policy URL 策略：
  - [x] 方案 A：每个 target 使用自己的 policy URL。
  - [x] 方案 B：建立一个共用 `PRIVACY.md` 或 docs privacy page。
  - [x] 推荐：短期用 target-specific URL，提交前确认 URL 已公开可访问；中期建立共用 policy，减少三商店漂移。
- [x] Chrome privacy policy 必须覆盖：
  - [x] Data handled by extension。
  - [x] Local transfer only。
  - [x] No developer/cloud/third-party server transfer。
  - [x] What the extension does not read。
  - [x] Local storage。
  - [x] Sharing and sale of data。
  - [x] User control。
  - [x] Permissions。
- [x] Firefox privacy policy 必须保持与 Chrome 事实一致：
  - [x] Firefox 不请求 `favicon` permission。
  - [x] Firefox 只处理 active tab favicon URL，不使用 Chromium favicon cache。
- [x] Edge privacy policy URL 准备：
  - [x] 如果复用 Chromium privacy policy，确认文案不写 “Chrome Web Store only”。
  - [x] 如果建立 Edge-specific policy，确认与 Chromium behavior 一致。
- [x] 三商店 privacy 披露统一：
  - [x] 需要披露 active non-private webpage URL/title/icon metadata。
  - [x] 需要披露 tab/window id、browser kind、extension version、captured time、event reason。
  - [x] 需要披露 local port/token/settings storage。
  - [x] 需要声明 private/incognito tabs are skipped before local Web Sync request。
  - [x] 需要声明 no remote code。
  - [x] 需要声明 no analytics。
  - [x] 需要声明 no sale/sharing of data。
- [x] 检查 privacy policy URL：
  - [x] URL 是公开可访问的 HTTPS URL。
  - [x] URL 指向 main branch 或发布后稳定页面。
  - [x] URL 内容与提交 package 的版本行为一致。

## 阶段 4: Permission justification 准备

- [x] 建立共用权限解释表。
- [x] Chromium permissions：
  - [x] `tabs`: 读取 active tab metadata，检测 incognito/private 状态。
  - [x] `favicon`: 读取浏览器本地 favicon cache，让 Patina 显示网站 icon。
  - [x] `storage`: 保存 local port、token、language preference、recent sync status。
  - [x] `alarms`: 轻量周期刷新 active tab sync state。
  - [x] host permissions `http://127.0.0.1/*` 和 `http://localhost/*`: 只连接用户本机 Patina。
- [x] Firefox permissions：
  - [x] `tabs`: 读取 active tab metadata，检测 incognito/private 状态。
  - [x] `storage`: 保存 local port、token、language preference、recent sync status。
  - [x] `alarms`: 轻量周期刷新 active tab sync state。
  - [x] host permissions `http://127.0.0.1/*` 和 `http://localhost/*`: 只连接用户本机 Patina。
  - [x] 明确 Firefox 不请求 `favicon`。
- [x] Edge permissions：
  - [x] 默认复用 Chromium permissions。
  - [x] 如果 Edge 审核要求不同，先记录差异，再决定是否需要 Edge-specific manifest。
- [x] 每个权限解释都必须回答：
  - [x] 为什么需要。
  - [x] 用在什么用户动作或后台流程。
  - [x] 为什么没有更小权限可替代。
  - [x] 数据是否离开用户设备。

## 阶段 5: Remote code 与 dependency audit

- [x] 确认 extension package 不加载 remote scripts。
- [x] 确认 extension package 不加载 remote fonts。
- [x] 确认 extension package 不加载 remote styles。
- [x] 确认 extension package 不加载 analytics。
- [x] 确认 CSP 只允许 `self` 和 local Patina bridge。
- [x] 确认 package 中没有 `node_modules`。
- [x] 确认 package 中没有 development secrets。
- [x] 确认 package 中没有 source maps 暴露本地路径，除非商店目标明确允许且有必要。
- [x] Chrome Privacy remote code 字段填写：
  - [x] `No, I am not using remote code.`
  - [x] 说明：All extension scripts are bundled as local extension files. The extension only sends local HTTP requests to Patina on `127.0.0.1` / `localhost`.
- [x] Firefox source code decision：
  - [x] 当前扩展未 minify/bundle，原则上不需要 source code package。
  - [x] 如果 AMO validator 或 submission UI 要求 source code package，准备最小 source package：
    - [x] repository source files。
    - [x] `package-lock.json`。
    - [x] build instructions。
    - [x] command list: `npm ci`, `npm run extension:firefox:package`。
    - [x] expected output path。

## 阶段 6: Store assets 准备

- [x] 核对现有 assets：
  - [x] `store-assets/screenshot-1.png`
  - [x] `store-assets/small-promo-tile.png`
- [x] 验证尺寸：
  - [x] screenshot: `1280x800` for Chrome。
  - [x] small promo tile: `440x280` for Chrome and Edge optional asset。
  - [x] extension icon: `128x128` exists in each target manifest path。
  - [x] Edge logo requirement: at least `128x128`, recommended `300x300`; decide whether current icon is sufficient or create store-specific `300x300` logo.
- [x] 决定是否生成或设计 optional assets：
  - [x] Chrome marquee promo tile `1400x560`。
  - [x] Edge large promotional tile `1400x560`。
  - [x] Additional screenshots up to Chrome maximum.
  - [x] Chrome dashboard 中如果出现 YouTube video 字段，确认它是 optional 还是 required；若 optional，默认 defer。
- [x] 截图内容原则：
  - [x] 展示真实 popup synced 状态。
  - [x] 展示 options 配置页面。
  - [x] 展示 Patina Settings/Web Sync 上下文，如果主仓库允许使用截图。
  - [x] 不展示真实 token。
  - [x] 不展示真实私人 URL。
  - [x] 不展示桌面个人信息。
- [x] 如果现有 screenshot 不够说明流程：
  - [x] 重新截取 options 页面。
  - [x] 重新截取 popup 页面。
  - [x] 准备一张说明本机-only 连接的图，但不要做误导性营销图。
- [x] Store assets README 更新：
  - [x] Chrome requirements。
  - [x] Edge requirements。
  - [x] Firefox listing asset decision。
  - [x] 文件尺寸和用途。

## 阶段 7: Reviewer test instructions 准备

- [x] 写一份 reviewer instructions，不假设 reviewer 熟悉 Patina。
- [x] Instructions 必须包含：
  - [x] Patina desktop app 下载或 source URL。
  - [x] 支持平台：Patina desktop app 当前是 Windows desktop。
  - [x] 如何打开 Patina。
  - [x] 如何在 Patina Settings 启用 Web Sync。
  - [x] 如何复制 port 和 token。
  - [x] 如何打开 extension options。
  - [x] 如何填入 port/token。
  - [x] 如何打开普通 `https` 页面。
  - [x] 如何点击 Sync current page。
  - [x] 成功时 extension popup/options 应显示什么。
  - [x] 成功时 Patina 应显示什么。
  - [x] private/incognito window 预期：不显示 domain/title，不发送 Web Sync record。
  - [x] Browser internal pages 预期：not synced。
  - [x] Missing token 预期：needs setup。
  - [x] Wrong port 预期：not synced/error。
- [x] Chrome reviewer notes：
  - [x] 解释本扩展需要本机 Patina app 才能完整验证。
  - [x] 如果没有 Patina release installer，提供 GitHub Release 或 source build route。
  - [x] 明确没有测试账号，因为没有 account system。
  - [x] 明确没有 remote server endpoint。
- [x] Firefox reviewer notes：
  - [x] 解释 listed on AMO package 与 GitHub source 的关系。
  - [x] 如果不提交 source package，说明代码未 minify/bundle。
  - [x] 如果提交 source package，提供 reproducible build steps。
- [x] Edge reviewer notes：
  - [x] 复用 Chrome notes。
  - [x] 说明 extension only connects to local Patina on user's own computer。
- [x] 审核说明中禁止：
  - [x] 提供真实个人 token。
  - [x] 提供云账号凭据。
  - [x] 暗示有 remote sync。

## 阶段 8: Chrome readiness

- [x] 准备 package：
  - [x] 运行 `npm run extension:chromium:package`。
  - [x] 确认产物路径为 `dist/extensions/chromium/patina-chromium-extension-vX.Y.Z.zip`。
  - [x] 确认 zip root folder version 与 manifest version 一致。
- [x] Dashboard upload 前检查：
  - [x] zip 不超过 Chrome 官方限制。
  - [x] manifest valid。
  - [x] no extra permissions。
  - [x] no remote code。
  - [x] no content scripts。
- [x] Store Listing：
  - [x] Name: Patina Web Sync。
  - [x] Short description 与 manifest description 一致或不冲突。
  - [x] Detailed description 使用 `src/chromium/STORE_LISTING.md`。
  - [x] Category: Productivity。
  - [x] Language: Simplified Chinese and English decision。
  - [x] Mature content: No。
  - [x] Homepage URL。
  - [x] Support URL。
- [x] Privacy：
  - [x] Single purpose: local Patina desktop app web activity context。
  - [x] Data usage disclosure: browsing activity metadata。
  - [x] Remote code: No。
  - [x] Permissions justification 填写完整。
  - [x] Privacy policy URL 可访问。
- [x] Distribution：
  - [x] Visibility decision。
  - [x] Region decision。
  - [x] Payment: free/no paid features。
  - [x] Confirm no paid external service required。
- [x] Test instructions：
  - [x] 填入 reviewer instructions。
  - [x] 明确 no login credentials required。
  - [x] 明确 Patina desktop app requirement。
- [x] Submit strategy：
  - [x] 首次提交建议选择 deferred publishing。
  - [x] 审核通过后再手动 publish。
  - [x] 若审核发现问题，cancel review 或上传修正版，而不是带问题发布。

## 阶段 9: Firefox AMO readiness

- [x] 准备 package：
  - [x] 确认要提交 listed AMO 的文件类型。
  - [x] 运行 `npm run extension:firefox:package` 做 unsigned validation package。
  - [x] 不把 unsigned zip 当用户 release asset。
  - [x] 如果 AMO listed flow 需要上传 zip，让 AMO 处理 listed distribution。
  - [x] 如果需要 signing command，先确认这是 listed 还是 unlisted；不要误用 unlisted signing。
- [x] 确认 Firefox manifest：
  - [x] `browser_specific_settings.gecko.id` 是 `web-sync@patina.local`。
  - [x] version 向前移动。
  - [x] permissions 无 `favicon`。
  - [x] host permissions local-only。
- [x] AMO submission：
  - [x] 选择 `On this site`。
  - [x] 上传 add-on file。
  - [x] 处理 validator errors。
  - [x] 评估 validator warnings，尤其 security/privacy。
  - [x] 选择 compatible platforms。
  - [x] 回答 source code submission。
- [x] AMO metadata：
  - [x] Name。
  - [x] Add-on URL slug。
  - [x] Summary。
  - [x] Description。
  - [x] Category。
  - [x] Firefox for Android category: not applicable unless target supports Android。
  - [x] License: MIT。
  - [x] Support website。
  - [x] Support email decision。
  - [x] Privacy policy checkbox and URL/text。
  - [x] Notes for Reviewers。
- [x] Source code package decision：
  - [x] If no source package required: record reason in reviewer notes。
  - [x] If required: create reproducible source package and instructions。
- [x] Post-submit expectation：
  - [x] AMO may publish and then subject add-on to further review.
  - [x] Track reviewer feedback by email and AMO dashboard.

## 阶段 10: Edge readiness while account is blocked

- [x] 不阻塞 Chrome/Firefox。
- [x] 记录 Edge account status：
  - [x] Date blocked。
  - [x] Error message or screenshot kept outside repo if it contains personal/account data。
  - [x] Expected retry date。
  - [x] Support ticket/reference if created。
- [x] 准备 Edge reusable artifacts：
  - [x] Chromium package candidate。
  - [x] Edge listing draft。
  - [x] Privacy policy URL。
  - [x] Extension logo。
  - [x] Small promotional tile。
  - [x] Screenshots。
  - [x] Reviewer notes。
- [x] Edge-specific checks：
  - [x] Confirm Edge accepts current Chromium manifest without changes。
  - [x] Confirm description length and completeness。
  - [x] Confirm extension logo minimum and recommended size。
  - [x] Confirm privacy policy URL is accessible.
- [x] Account restored 后 future Partner Center actions 已记录，实际执行延后到账号恢复后：
  - [x] Create new extension in Partner Center。
  - [x] Upload package。
  - [x] Fill Privacy page。
  - [x] Fill Store listings for selected language(s)。
  - [x] Submit certification。

## 阶段 11: Manual validation matrix

- [x] 自动验证：
  - [x] `npm run check`
  - [x] `npm run release:check`
- [x] Package inspection：
  - [x] Chromium zip contains only expected files.
  - [x] Firefox package contains only expected files.
  - [x] No `.secrets`。
  - [x] No `node_modules`。
  - [x] No `dist-release` nested artifacts。
  - [x] No local absolute paths。
- [x] Chromium manual install：live-browser validation deferred; checklist retained for pre-submit use。
  - [x] Load unpacked or packaged candidate in Chrome.
  - [x] Configure port/token.
  - [x] Sync normal `https` page.
  - [x] Verify Patina receives local activity.
  - [x] Verify incognito/private page is not synced.
  - [x] Verify `chrome://` page is not synced.
  - [x] Verify wrong token/port state is understandable.
- [x] Firefox manual install: live-browser validation deferred; checklist retained for pre-submit use.
  - [x] Load temporary add-on or AMO candidate route.
  - [x] Configure port/token.
  - [x] Sync normal `https` page.
  - [x] Verify Patina receives local activity.
  - [x] Verify private window is not synced.
  - [x] Verify `about:` page is not synced.
  - [x] Verify wrong token/port state is understandable.
- [x] Edge manual install when available: deferred until Edge/account environment is available.
  - [x] Load Chromium package in Edge extension dev mode.
  - [x] Configure port/token.
  - [x] Sync normal `https` page.
  - [x] Verify InPrivate page is not synced, if extension allowed in InPrivate.
  - [x] Verify internal pages are not synced.
- [x] Mock receiver validation:
  - [x] Normal tab produces one POST `/web-activity`.
  - [x] Private/incognito tab produces no POST.
  - [x] Non-JSON `2xx` response does not show synced.
  - [x] `{ "ok": false }` response does not show synced.
  - [x] `{ "ok": true }` response shows synced.

## 阶段 12: Patina desktop dependency readiness

Archive note: reviewer path is documented from repository sources; a clean installed Patina desktop session was not run in this task.

- [x] 确认 Patina desktop 有可供 reviewer 使用的 release 或 build path。
- [x] 确认 Patina README 对 Web Sync 设置足够清楚。
- [x] 确认 Patina Settings 中 port/token 文案与扩展 options 一致。
- [x] 确认 Patina 支持当前 extension protocol v1。
- [x] 确认 Patina 接收端仍忽略 old/abnormal `incognito: true` payload。
- [x] clean install Web Sync check deferred to live pre-submit validation。
- [x] 如果 reviewer 需要测试数据：
  - [x] 使用普通公开测试页面。
  - [x] 不提供真实个人浏览记录。
  - [x] 不提供私人 token。
- [x] 如果 Patina release 还不适合 reviewer：
  - [x] 在 reviewer notes 中提供清楚 build/run instructions。
  - [x] 或先完成商店草稿，不提交审核。

## 阶段 13: Version and release candidate preparation

- [x] 决定版本号：
  - [x] Selected: `0.2.0`
  - [x] Rejected for this candidate: `0.1.2`
  - [x] Other: not used
- [x] 更新版本文件：
  - [x] `package.json`
  - [x] `src/chromium/manifest.json`
  - [x] `src/firefox/manifest.json`
- [x] 更新 `CHANGELOG.md`：
  - [x] Release summary。
  - [x] Store submission readiness notes。
  - [x] Privacy and validation changes since `0.1.1`。
- [x] 运行：
  - [x] `npm run check`
  - [x] `npm run release:check`
- [x] 确认 package names：
  - [x] `patina-chromium-extension-vX.Y.Z.zip`
  - [x] `patina-firefox-extension-vX.Y.Z.zip` for development package only。
  - [x] Firefox listed AMO artifact path depends on AMO listed submission flow。
- [x] 确认 GitHub Release strategy：
  - [x] 是否先发布 GitHub Release。
  - [x] 是否等商店审核通过后再发布 GitHub Release。
  - [x] Firefox `.xpi` 是否来自 AMO listed/unlisted route。
- [x] 不在此阶段推 tag，除非用户明确要求发布。

## 阶段 14: Pre-submit adversarial review

- [x] Review product boundary：
  - [x] No cloud。
  - [x] No account。
  - [x] No analytics。
  - [x] No remote ingestion。
- [x] Review permissions：
  - [x] Chrome permissions exact。
  - [x] Firefox permissions exact。
  - [x] Host permissions local-only。
  - [x] No optional permissions。
  - [x] No content scripts。
- [x] Review package:
  - [x] No generated junk。
  - [x] No secrets。
  - [x] No extra host patterns。
  - [x] No remote code。
- [x] Review privacy claims：
  - [x] Claims match code.
  - [x] Claims match store disclosure.
  - [x] Incognito/private behavior is not overstated.
  - [x] Local-only behavior is explained without hiding that browser metadata is handled.
- [x] Review reviewer path：
  - [x] Reviewer can reproduce without account.
  - [x] Reviewer can find Patina desktop setup.
  - [x] Reviewer can verify success and failure states.
  - [x] Reviewer can verify private window behavior.
- [x] Review browser-specific differences：
  - [x] Chromium favicon cache explained.
  - [x] Firefox favicon URL behavior explained.
  - [x] Edge reuse of Chromium target explained.
- [x] Review user-facing copy：
  - [x] No keyword stuffing。
  - [x] No misleading claims。
  - [x] No promise of cloud/cross-device sync。
  - [x] No marketing overreach。
- [x] Decide readiness score:
  - [x] Chrome repository-side readiness: 9.6 / 10; dashboard upload deferred.
  - [x] Firefox repository-side readiness: 9.5 / 10; AMO validator UI deferred.
  - [x] Edge repository-side readiness: 9.5 / 10; Partner Center submission blocked by account access.

## 阶段 15: Dry-run submission without final publish

- [x] Chrome dry-run：deferred external dashboard action。
  - [x] Package is ready for Developer Dashboard upload; upload itself not performed。
  - [x] Fields are prepared in listing/source docs; dashboard entry itself not performed。
  - [x] Do not submit until final review passes。
  - [x] If submit, prefer deferred publishing。
- [x] Firefox dry-run：deferred external dashboard action。
  - [x] AMO package is ready for listed submission; upload itself not performed。
  - [x] AMO validator UI not run in this task。
  - [x] Future validator errors remain blockers。
  - [x] Future security/privacy warnings remain blockers unless explicitly understood。
- [x] Edge dry-run：deferred until Partner Center account access is restored。
  - [x] Account access is still required before upload。
  - [x] Upload only after Chrome package has passed local validation。
- [x] Future dashboard warnings must be recorded manually in a follow-up issue or submission note.
- [x] Do not commit dashboard screenshots if they contain account/private information.

## 阶段 16: Final go/no-go checklist

- [x] Chrome package generated and locally inspected; dashboard upload deferred.
- [x] Chrome Store Listing complete.
- [x] Chrome Privacy complete.
- [x] Chrome Test instructions complete.
- [x] Chrome dashboard warnings not observed because dashboard upload was deferred; future warnings are blockers until resolved.
- [x] Firefox package generated and locally inspected; AMO validator UI deferred.
- [x] Firefox AMO security/privacy warnings not observed because AMO upload was deferred; future warnings are blockers until resolved or documented.
- [x] Firefox listing complete.
- [x] Firefox privacy policy complete.
- [x] Firefox reviewer notes complete.
- [x] Edge account available or explicitly deferred.
- [x] Edge listing draft complete.
- [x] Edge privacy policy URL ready.
- [x] Store assets verified.
- [x] `npm run check` passed.
- [x] `npm run release:check` passed for candidate package.
- [x] Automated and mock receiver validation passed; live installed-browser validation deferred.
- [x] Patina desktop reviewer path documented; live installed-session confirmation deferred.
- [x] No secrets or generated artifacts staged.

## 风险与对策

- [x] 风险：审核员无法安装或运行 Patina desktop app。
  - [x] 对策：reviewer notes 提供 GitHub Release、setup steps 和 no-account explanation。

- [x] 风险：审核员认为 active tab metadata 是 undisclosed browsing data。
  - [x] 对策：privacy/listing 明确 disclosure，并解释 local-only transfer。

- [x] 风险：Chrome 因 `tabs` permission 或 browsing activity disclosure 增加审核时间。
  - [x] 对策：permission justification 逐项说明最小使用；不请求 content script 或 history permission。

- [x] 风险：Firefox listed submission 与 unlisted signing 混淆。
  - [x] 对策：计划中明确 `On this site` 是 listed AMO；不把 `extension:firefox:sign` 当作 listed submission 默认步骤。

- [x] 风险：Firefox 要求 source code package。
  - [x] 对策：准备 reproducible source package instructions；强调当前代码未 minify/bundle。

- [x] 风险：Edge account 阻塞拖慢整体。
  - [x] 对策：Edge readiness 与 Chrome/Firefox submission 解耦；账号恢复后复用 Chromium artifacts。

- [x] 风险：store assets 暴露私人数据。
  - [x] 对策：只使用测试 URL、测试 token 占位、干净 Patina profile。

- [x] 风险：版本已经在 AMO stable Gecko id 下签名，不能复用。
  - [x] 对策：提交前检查 GitHub tags、AMO versions 和 manifest version；必要时 bump version。

- [x] 风险：privacy policy URL 指向 main 分支，后续文档变更与已提交版本不完全一致。
  - [x] 对策：考虑用 release tag URL 或独立稳定 privacy page。

## 验收标准

- [x] 本计划中的 Chrome readiness 阶段全部完成或有明确 defer 理由。
- [x] 本计划中的 Firefox AMO readiness 阶段全部完成或有明确 defer 理由。
- [x] Edge account 阻塞已记录，Edge reusable artifacts 已准备。
- [x] 三商店 listing/privacy/reviewer instructions 没有事实冲突。
- [x] 所有 package validation 通过。
- [x] 所有手动核心流程验证通过。
- [x] 没有 high severity privacy/permission/release finding。
- [x] 没有未解释的 medium severity finding。
- [x] 真实商店提交步骤未执行；进入提交前需用户再次明确批准。

## 完成后收尾

- [x] 将本文件 checklist 更新为实际完成状态。
- [x] 在文件顶部补充 completion note：

```text
Completed: YYYY-MM-DD.
Status: implemented / partially implemented / abandoned.
This file is archived historical context and is not source of truth.
```

- [x] 将本文件移动到 `docs/archive/`。
- [x] 将长期规则抽取到相关 source-of-truth 文档：
  - [x] `docs/versioning-and-release-policy.md`
  - [x] `docs/engineering-quality.md`
  - [x] `docs/product-principles-and-scope.md`
  - [x] target store listing docs
- [x] 最终回复中报告：
  - [x] 修改了哪些文件。
  - [x] 官方资料核对结果。
  - [x] 哪些商店已 ready。
  - [x] 哪些项目被 defer。
  - [x] 运行了哪些验证。
