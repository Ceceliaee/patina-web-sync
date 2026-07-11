# 三家扩展商店共用上架资料执行方案

> 文档类型：How-to / 一次性执行方案
>
> 创建日期：2026-07-10
>
> 适用仓库：`C:\Users\SYBao\Documents\Code\Patina-Web-Sync`
>
> 当前候选版本：`0.2.0`
>
> 目标平台：Chrome Web Store、Firefox AMO、Microsoft Edge Add-ons
>
> 当前状态：已完成并归档；2026-07-11 已纠正完整 URL 导出契约
>
> 归档状态：2026-07-10 已移入 `docs/archive/`

## 1. 文档目的

本文用于把 Patina Web Sync 当前仓库状态推进到“共用上架资料完整、真实、一致、经过验证，可以交给三家商店各自的提交任务”的状态。

本文不是商店字段参考手册，也不是发布日志。它是一份按依赖顺序执行的可勾选方案，解决下面的问题：

- 如何先确认扩展实际上做了什么，再写商店文案。
- 如何让 manifest、运行时行为、隐私政策、权限说明、审核说明和图片素材互不矛盾。
- 如何处理 Chrome、Firefox 和 Edge 的规则差异，而不复制三套容易漂移的事实。
- 如何在首次提交前发现隐私、版本、数据同意、素材和打包问题。
- 如何留下足够证据，让后续三个“实际发布”任务可以独立执行。

## 2. 使用方法

- 严格按阶段顺序执行；只有阶段出口条件满足后，才进入下一阶段。
- 每完成一项，将 `- [x]` 改为 `- [x]`。
- 每个需要判断的地方，先填写“决策记录”，再修改代码或文档。
- 遇到商店后台与本文不一致时，以当前商店后台和官方文档为准，并同步更新长期文档。
- 不要在本方案中记录真实 token、开发者账号资料、个人地址或其他秘密。
- 不要为了验证本方案运行 `npm run extension:firefox:sign`。
- 不要在本方案完成时自动提交商店；真实提交属于三个独立上架任务。

## 3. 第一性原理

### 3.1 上架不是“填表”，而是一致性证明

商店审核最终要回答的不是“字段是否填满”，而是下面六个事实面是否描述同一个产品：

1. **运行时行为**：扩展实际读取、保存、发送和跳过什么。
2. **包声明**：manifest 声明了哪些权限、主机、数据类型、版本和入口。
3. **公开承诺**：商店文案和隐私政策向用户承诺了什么。
4. **审核可复现性**：审核员能否在没有开发者陪同的情况下复现主要功能和边界。
5. **视觉证据**：截图和宣传图是否真实展示当前版本，而不是展示旧版本或理想状态。
6. **发布工件**：最终上传的 zip 是否正是上述材料所描述的代码。

只要其中任意两面矛盾，就不能判定“资料准备完成”。

### 3.2 事实来源有优先级

发生冲突时按下面顺序处理：

1. 当前扩展源码和实际网络行为。
2. 构建后包内的 manifest 与文件。
3. 当前顶层长期文档。
4. `STORE_LISTING.md`、`PRIVACY.md` 和审核说明。
5. 商店后台草稿。
6. 截图、旧计划和历史说明。

不能为了让旧文案继续成立而忽略真实行为。应先决定真实行为是否合理；若合理，更新文案；若不合理，先修改实现并验证，再更新文案。

### 3.3 最小数据优先于更宽泛的声明

扩展不应通过“多勾几个数据类别”来替代数据最小化。对每个字段都必须回答：

- 用户价值是什么？
- 不发送会损失什么？
- 能否在浏览器侧先裁剪、聚合或删除？
- 是否必须持久化？
- 商店会把它归为哪类数据？

如果字段没有当前用户价值，应优先删除，而不是只补充隐私声明。

### 3.4 共用资料保存事实，平台段保存差异

共用层只保存不会因商店改变的产品事实：

- 产品名称和单一用途。
- 自动同步行为和用户前置条件。
- 处理的数据、目的、去向、保存方式和用户控制。
- 无账号、无云服务、无广告、无分析、无远程代码。
- 私密窗口和浏览器内部页面的处理方式。

平台层只保存商店特有内容：

- 字段名称和长度限制。
- 图片尺寸和数量。
- Firefox 数据同意 manifest 声明。
- Chrome / Edge 权限理由输入框。
- 包格式和提交流程差异。

### 3.5 外部发布必须可逆

仓库内准备可以反复修改；商店公开发布会产生审核记录、用户和版本约束。因此本方案的终点是“可提交”，不是“已公开”。首次提交优先使用草稿、延迟发布或等价的可控状态。

## 4. 成功标准

只有下面所有条件成立，才可把共用资料任务标记为 Done：

- [x] 运行时数据流已经逐字段审计，并形成可追溯的数据处理矩阵。
- [x] 自动同步、手动同步、本机通信、私密窗口和失败状态均被准确描述。
- [x] Firefox 数据收集与传输声明满足当前 AMO 要求，并被验证脚本保护。
- [x] 中文和英文商店文案内容等价，不存在一方多承诺或少披露。
- [x] 隐私政策覆盖 token、网页地址、标题、图标和同步技术元数据的真实处理方式。
- [x] Chrome、Firefox 和 Edge 的字段对照均可直接用于后台填写。
- [x] 审核员可以按文档独立完成安装、配置、正常同步、私密窗口和失败状态验证。
- [x] 所有计划上传的图片尺寸正确、状态真实、无个人信息、无真实 token、无过时界面。
- [x] `STORE_LISTING.md` 中不存在失效路径或“Edge 账号受阻”等过时状态。
- [x] 支持链接统一指向 Patina Web Sync 仓库的 Issues，而不是桌面端 Issues。
- [x] `npm run check` 通过。
- [x] `npm run release:check` 通过。
- [x] 生成包经过内容检查，未包含秘密、源码仓库垃圾或生成物嵌套。
- [x] 三个平台各自获得明确的 go / no-go 结论和剩余阻塞项。
- [x] 未执行 AMO 正式签名、Git tag、GitHub Release 或商店公开发布。

## 5. 范围边界

### 5.1 本方案包含

- 共用中英文商店文案。
- 平台字段映射和权限理由。
- 共用隐私政策。
- 审核员测试说明。
- Chrome、Firefox、Edge 图片素材整理和 QA。
- Firefox 数据同意、数据分类和最低版本前置判断。
- Chrome / Edge listing 多语言能力前置判断。
- 稳定规则所需的验证脚本和长期文档更新。
- 上传前本地构建、打包和 go / no-go 检查。

### 5.2 本方案不包含

- 注册或验证开发者账号；三家账号已完成注册。
- 在商店后台创建正式提交并点击 Submit / Publish。
- 处理商店审核反馈；反馈应进入对应平台发布任务。
- 发布 Git tag 或 GitHub Release。
- 运行 Firefox AMO 正式签名命令。
- 修改 Patina 桌面端接收器、数据库或 UI，除非数据最小化判断证明扩展侧无法独立完成，并另行获得授权。
- 新增云服务、账号、分析、远程采集或团队能力。

## 6. 当前基线

### 6.1 已确认状态

- [x] Chrome Web Store 开发者账号已注册。
- [x] Firefox AMO 开发者账号已注册。
- [x] Microsoft Edge Add-ons 开发者账号已注册并验证。
- [x] 当前 `package.json`、Chromium manifest 和 Firefox manifest 均为 `0.2.0`。
- [x] 当前 Git tag 最高为 `v0.1.1`。
- [x] 仓库已有 `STORE_LISTING.md`、`PRIVACY.md`、`docs/store-submission.md` 和审核员测试说明。
- [x] 工作区已有未提交的商店素材重组，不得覆盖或丢弃。
- [x] Chrome 成品目录已有 `128x128` 图标、`440x280` 小宣传图和四张 `1280x800` 截图。
- [x] Firefox 成品目录已有 `32x32`、`64x64` 图标和两张 `1280x800` 截图。
- [x] Edge 成品目录已有 `300x300` logo 和 `440x280` 小宣传图。

### 6.2 已发现但尚未解决的问题

- [x] `STORE_LISTING.md` 仍引用重组前的素材路径。
- [x] `STORE_LISTING.md` 和 `docs/store-submission.md` 仍声称 Edge 开发者账号受阻。
- [x] 当前共用 listing 只有完整英文文案，没有可直接粘贴的完整简体中文文案。
- [x] 当前隐私与支持联系方式指向 Patina 桌面端 Issues，而不是扩展仓库 Issues。
- [x] Firefox manifest 缺少新扩展所需的 `data_collection_permissions`。
- [x] Firefox manifest 没有处理 Firefox 139 及更早版本的数据同意兼容问题。
- [x] 当前文案没有足够明确地说明配置完成后存在事件驱动和周期性自动同步。
- [x] 当前隐私声明对本机 token、完整 URL 查询参数和技术元数据的数据分类仍需逐项确认。
- [x] 当前 manifests 没有 `_locales` / `default_locale`，Chrome 多语言 listing 能力需要先做决策。
- [x] Chrome popup 截图包含已登录浏览器外观和实时 GitHub 页面信息，不适合作为最干净的长期商店证据。
- [x] 部分中文 options 截图显示“已保存”但端口或 token 看起来为空，状态证据不一致。
- [x] 当前审核说明以手动“同步当前页”为主，没有覆盖配置完成后的自动同步验证。
- [x] 当前没有专门校验商店素材路径、尺寸、陈旧状态文案和隐私声明关键字段的自动化检查。

## 7. 官方规则快照

规则最后复核日期：`2026-07-10`。

执行前和真正上传前都要重新打开这些官方页面：

- [Chrome Web Store：填写 listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing/)
- [Chrome Web Store：填写隐私字段](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy/)
- [Chrome Web Store：listing 要求](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements)
- [Microsoft Edge：发布扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)
- [Firefox AMO：提交附加组件](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Firefox AMO：Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
- [Firefox：内置数据收集与传输同意](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/)
- [Firefox：创建清晰的 listing](https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/)

执行规则：

- [x] 记录复核日期和每个页面的关键变化。
- [x] 若后台实际必填项与官方文档不同，以后台校验为当前提交事实。
- [x] 若规则变化形成长期要求，同步更新 `docs/store-submission.md` 或 `docs/versioning-and-release-policy.md`。
- [x] 不把一次性后台截图直接当作长期规则；长期文档只记录稳定约束。

## 8. 交付物清单

| 编号 | 交付物 | 主要文件 | 完成证据 |
| --- | --- | --- | --- |
| D1 | 运行时事实与数据处理矩阵 | `STORE_LISTING.md`、`PRIVACY.md` | 每个字段都有来源、用途、去向、保存和分类 |
| D2 | 中英文共用 listing | `STORE_LISTING.md` | 可直接粘贴，字符数和含义已校验 |
| D3 | 权限与数据声明 | `STORE_LISTING.md`、manifests | 与源码、隐私政策和后台选择一致 |
| D4 | 共用隐私政策 | `PRIVACY.md` | 公开可访问，覆盖所有真实数据行为 |
| D5 | 审核员测试步骤 | `docs/store-reviewer-test-instructions.md` | 无账号即可复现主路径和边界 |
| D6 | 长期提交参考 | `docs/store-submission.md` | 不含账号旧状态，三平台差异清晰 |
| D7 | 素材成品与来源说明 | `store-assets/` | 尺寸、内容、命名、来源均通过检查 |
| D8 | 稳定验证门 | `scripts/`、`package.json` | `npm run check` 能阻止关键漂移 |
| D9 | 三平台 go / no-go 记录 | 本文第 20 节 | 每个平台有证据和剩余阻塞项 |

## 9. 阶段 0：保护现场并建立执行基线

### 9.1 保护现有未提交改动

- [x] 在仓库根目录运行：

```powershell
git status --short --branch
git diff --stat
git diff --numstat
```

- [x] 把当前未提交文件列表复制到本阶段的执行记录中。
- [x] 确认这些改动属于已有素材重组和文档调整，不是无关工作。
- [x] 不运行 `git reset --hard`、`git checkout --` 或会覆盖工作区的命令。
- [x] 后续修改重叠文件前，先阅读现有 diff，保留已有意图。

### 9.2 固定候选版本事实

- [x] 读取 `package.json` 和两个 manifest 的版本。
- [x] 运行 `npm run check:versions`。
- [x] 检查本地 tag：

```powershell
git tag --list --sort=-version:refname
```

- [x] 在 AMO Developer Hub 检查稳定 Gecko id `web-sync@patina.local` 已接受或已签名的最高版本。
- [x] 记录 Chrome Web Store 和 Edge Partner Center 是否已经上传过 `0.2.0` 草稿。
- [x] 如果 `0.2.0` 已在 AMO 被接受或签名，禁止再次签名；在真正提交前把三处版本统一提升到下一个版本。
- [x] 如果 `0.2.0` 只存在于本地、没有任何商店签名或发布事实，可继续把它作为候选版本修改。

### 9.3 建立证据目录规则

- [x] 确认成品素材只放在对应商店目录。
- [x] 确认 `store-assets/source/` 只保存源图和历史素材，不直接上传。
- [x] 确认 `dist/`、`dist-release/`、`web-ext-artifacts/` 保持忽略且不进入 commit。
- [x] 约定所有截图使用假端口、假 token、无登录浏览器配置和公共测试页面。

**阶段出口条件**

- [x] 未提交改动已被识别并受到保护。
- [x] 候选版本是否可继续使用已有明确结论。
- [x] 不存在“误签 Firefox 旧版本”的风险。

## 10. 阶段 1：建立唯一运行时事实

### 10.1 审计权限和网络边界

- [x] 对两个 manifest 分别列出 `permissions`、`host_permissions`、可选权限、CSP 和入口文件。
- [x] 确认 Chromium 仅使用：`alarms`、`favicon`、`storage`、`tabs`。
- [x] 确认 Firefox 仅使用：`alarms`、`storage`、`tabs`，不请求 `favicon`。
- [x] 确认 host permissions 只有：

```text
http://127.0.0.1/*
http://localhost/*
```

- [x] 确认没有 content scripts、远程脚本、远程模块、远程字体或分析 SDK。
- [x] 搜索所有网络请求，确认 favicon 本地缓存请求与 Patina bridge 请求之外没有其他目标：

```powershell
rg -n "fetch\(|XMLHttpRequest|WebSocket|sendBeacon|import\(" src scripts
```

### 10.2 审计触发方式

- [x] 列出所有自动触发源：安装、浏览器启动、标签页激活、标题或 URL 更新、窗口聚焦、定时 alarm。
- [x] 列出手动触发源：popup 或 options 中的“同步当前页”。
- [x] 确认配置完成后，自动触发不要求用户每次点击。
- [x] 确认文案必须使用“自动同步当前活动网页”或等价表达，不能只描述手动按钮。
- [x] 记录 alarm 周期及其用户价值，确认频率仍然必要且不会造成不合理资源消耗。

### 10.3 审计私密与不支持页面

- [x] 确认 private / incognito / InPrivate 判断发生在 payload 构造和 favicon 读取之前。
- [x] 确认私密标签页不会发送 URL、标题、图标或同步 payload。
- [x] 确认 `chrome://`、`edge://`、`about:`、扩展页面等非 `http` / `https` 页面不发送网页活动。
- [x] 确认 popup 不在私密窗口展示私密页面的标题或域名。
- [x] 确认 Patina 接收端仍有私密 payload 后备过滤，但不把它当作扩展端过滤的替代品。

### 10.4 建立逐字段数据处理矩阵

先按当前实现填写，不要按期望实现填写：

| 数据 | 当前来源 | 当前用途 | 当前去向 | 当前保存 | 初步商店分类 | 待确认 |
| --- | --- | --- | --- | --- | --- | --- |
| 本机端口 | 用户输入 | 构造 Patina 本机地址 | 不作为 payload 字段发送 | 扩展本地 storage | 配置 / 技术数据 | 是否只需本地披露 |
| bearer token | 用户输入 | 鉴权本机 Patina 请求 | Authorization header 到本机 Patina | 扩展本地 storage | Authentication information | 三商店均需披露 |
| 完整 URL | `tabs` API | 识别当前页面并支持 URL 导出 | 本机 Patina | Patina 本机保存完整 URL，并派生域名用于分类 | Browsing activity；查询参数可能含 search terms | 最终保留完整 URL |
| 页面标题 | `tabs` API | 提供网站上下文 | 本机 Patina | 按 Patina 设置处理 | Website content | 是否始终需要 |
| favicon URL / data | tab 元数据或 Chromium favicon cache | 展示网站图标 | 本机 Patina | 本机 Patina | Website content | Chromium / Firefox 差异 |
| browser client id | 扩展生成 UUID | 区分浏览器客户端 | 本机 Patina | 扩展 storage 与 Patina | Technical and interaction | Firefox 必须可选或省略 |
| browser kind | User-Agent 推断 | 标记浏览器来源 | 本机 Patina | Patina | Technical and interaction | Firefox 可否省略 |
| extension version | manifest | 兼容与诊断 | 本机 Patina | Patina 运行时状态 | Technical and interaction | Firefox 可否省略 |
| tab / window id | `tabs` API | 协议元数据 | 本机 Patina | 默认不作为长期业务数据使用 | Technical and interaction | 是否可删除 |
| captured time | 扩展时钟 | 采集时序 | 本机 Patina | Patina | Technical and interaction | 是否可由接收端生成 |
| event reason | 扩展事件 | 诊断触发来源 | 本机 Patina | Patina 或运行时 | Technical and interaction | 是否可删除或可选 |
| language | 扩展 UI | 选择界面语言 | 不发送 | 扩展 storage | Local setting | 不应声明为远程传输 |
| recent sync status | bridge 响应 | 展示连接状态 | 不发送给第三方 | 扩展 storage | Local interaction state | 不应声明为分析数据 |

- [x] 对每一行补充源码文件和行号证据。
- [x] 对每一行回答“不发送会损失什么”。
- [x] 对每一行确认是否进入隐私政策、Chrome / Edge privacy form 和 Firefox manifest。
- [x] 对“完整 URL”单独检查搜索页 URL 中的查询参数风险。
- [x] 对 token 明确记录：虽然不发送给开发者，但它离开浏览器进入本机 Patina，因此不能简单写成“没有传输”。

### 10.5 数据最小化决策门

- [x] 决定是否继续发送完整 URL，或在扩展侧裁剪到 origin / hostname。
- [x] 如果继续发送完整 URL（最终采用）：
  - [x] 文案和隐私政策明确披露完整网页地址。
  - [x] 评估查询参数可能包含搜索词或其他敏感内容的分类影响。
  - [x] 不声称“只发送域名”。
- [x] 如果改为 origin / hostname（2026-07-11 判定为 N/A）：
  - [x] 复核发现 Patina 数据导出的“URL 地址”字段依赖完整 URL，因此不得采用裁剪方案。
  - [x] 两个浏览器目标和协议文档已恢复完整 URL 契约。
  - [x] 测试改为证明 path、query 和 fragment 原样进入本机 payload 与导出。
  - [x] listing 和隐私政策已披露完整 URL 与 search terms 风险。
- [x] 决定 Firefox 是否必须发送所有技术元数据。
- [x] 对 Firefox 技术元数据采用以下一种明确策略，不得混用：
  - [x] **推荐策略**：将 `technicalAndInteraction` 声明为 optional；运行时检查授权，只在用户允许时发送技术字段。
  - [x] **最小策略**：Firefox 永不发送非必要技术字段，依赖 Patina 对缺失字段的兼容默认值。
- [x] 禁止把 `technicalAndInteraction` 放入 required；Firefox 当前规则不允许这样做。
- [x] 如果技术数据被拒绝，核心网页同步仍应工作；不能因用户拒绝可选技术数据而禁用主功能。

**阶段出口条件**

- [x] 数据矩阵覆盖所有读取、storage 和传输字段。
- [x] 完整 URL 和 Firefox 技术数据均有书面决策。
- [x] 最终产品事实可以用一句话准确描述，没有模糊的“同步一些信息”。

## 11. 阶段 2：处理 Firefox 数据同意与版本前置

### 11.1 确定 Firefox 数据分类

依据最终数据矩阵逐项确认，而不是直接复制下面建议：

- [x] `authenticationInfo`：本机 Patina bearer token。
- [x] `browsingActivity`：当前活动网页 URL / 域名。
- [x] `websiteContent`：页面标题和网站图标信息。
- [x] `searchTerms`：完整 URL 查询参数可能包含搜索词，已列入 Firefox required 和三平台数据声明。
- [x] `technicalAndInteraction`：只能 optional，并且运行时尊重用户选择。
- [x] 不声明 `websiteActivity`，因为扩展不读取点击、滚动、输入或下载等行为。
- [x] 不使用 `none`，因为扩展确实把数据传出浏览器到本机 Patina。

### 11.2 选择旧版 Firefox 处理策略

- [x] 采用 Firefox 官方建议之一：最低版本、旧版关闭传输、自定义同意页。
- [x] 最终首发选择：设置 `strict_min_version: "142.0"`，使用 Firefox 内置同意体验；142 同时消除 AMO Android compatibility warning，且不声明 Android target。
- [x] 在 README、AMO listing 和审核说明中记录最低 Firefox 版本。
- [x] Firefox 152 隔离临时 profile 已成功启动到附加组件管理器；画面检查受当前安全策略限制，使用零警告 AMO validator 和 manifest / runtime tests 作为补充证据。

### 11.3 修改 manifest 与运行时

- [x] 在 `src/firefox/manifest.json` 的稳定 Gecko id 下添加最终 `data_collection_permissions`。
- [x] 保持 `browser_specific_settings.gecko.id` 为 `web-sync@patina.local`。
- [x] 添加最终 `strict_min_version`。
- [x] 声明 optional technical data：
  - [x] 在发送前通过 `browser.permissions.getAll()` 检查 `data_collection`。
  - [x] 未授权时从 payload 删除所有技术与交互字段。
  - [x] 不重复弹出自定义 consent。
  - [x] 添加允许与拒绝两条测试路径。
- [x] 完全省略技术数据方案未采用，已判定 N/A：
  - [x] 已由 optional 拒绝路径证明 Firefox payload 可不含这些字段。
  - [x] 已验证 Patina 接收端 schema 兼容字段缺失。

### 11.4 把规则编码进验证脚本

- [x] 扩展 `scripts/firefox-extension.ts` 的 manifest 类型定义。
- [x] 校验稳定 Gecko id。
- [x] 校验 `strict_min_version`。
- [x] 校验 required 数据类型集合精确匹配最终决策。
- [x] 校验 `technicalAndInteraction` 不会进入 required。
- [x] 校验 background 在构造可选技术字段前检查授权。
- [x] 更新 `docs/engineering-quality.md`，把 Firefox 数据同意声明变成长期不变量。
- [x] 更新 `docs/versioning-and-release-policy.md`，说明首次公开 AMO listing 与旧 unlisted 签名版本的版本关系。

### 11.5 验证 Firefox 包

- [x] 运行：

```powershell
npm run extension:firefox:check
npm run extension:firefox:package
```

- [x] 检查 zip 根目录直接包含 `manifest.json`，没有多一层文件夹。
- [x] 使用本地 Firefox 152 隔离临时 profile 启动候选扩展；未接触日常 profile，测试后已清理进程。
- [x] 使用 `web-ext lint --warnings-as-errors` 检查 manifest 数据声明：0 errors、0 notices、0 warnings。
- [x] 未执行 `npm run extension:firefox:sign`。

**阶段出口条件**

- [x] Firefox manifest 符合当前数据同意规则。
- [x] 用户拒绝 optional 技术数据时，核心同步仍可工作。
- [x] 验证脚本能阻止数据声明被未来修改遗漏。

## 12. 阶段 3：建立中英文共用商店文案

### 12.1 固定不可变产品事实

- [x] 产品名统一为 `Patina Web Sync`。
- [x] 单一用途统一为：为本机 Patina 自动补充当前非私密活动网页的时间记录上下文。
- [x] 明确依赖免费的 Patina Windows 桌面应用。
- [x] 明确没有账号、付费功能、云同步、广告、分析和第三方服务器。
- [x] 明确配置需要 Patina 提供的本机端口和 token。
- [x] 明确只支持普通 `http` / `https` 页面。
- [x] 明确私密窗口在扩展端发送前被跳过。
- [x] 明确配置完成后存在自动同步，同时保留手动“同步当前页”。
- [x] 明确数据只发往 `127.0.0.1` 或 `localhost` 上的 Patina。

### 12.2 重构 `STORE_LISTING.md`

最终顺序：

1. 文档使用说明和事实版本。
2. Shared facts。
3. `en-US` 可粘贴文案。
4. `zh-CN` 可粘贴文案。
5. 数据分类和权限理由。
6. Chrome Web Store 字段。
7. Firefox AMO 字段。
8. Microsoft Edge Add-ons 字段。
9. 审核员短说明。
10. 素材路径。

- [x] 英文短描述是完整句子，并保持在 manifest / 商店限制内。
- [x] 写对应的简体中文短描述，含义与英文等价。
- [x] 英文和中文长描述都从一句清晰价值说明开始。
- [x] 两种语言都说明自动同步、依赖桌面端、本机传输和私密窗口边界。
- [x] 两种语言都说明具体处理的数据，不使用“必要信息”等模糊词。
- [x] 两种语言都说明不读取正文、表单、密码、cookie、截图、剪贴板、下载历史或浏览器历史数据库。
- [x] 两种语言的功能列表数量和含义保持一致。
- [x] 删除 Edge 账号受阻说明，改为账号已就绪但实际提交仍是独立任务。
- [x] 把所有素材路径更新为新的平台目录。
- [x] 把支持网站改为 `https://github.com/Ceceliaee/patina-web-sync/issues`。

### 12.3 字符数与可粘贴性检查

- [x] 记录英文和中文短描述字符数：英文 84，中文 34。
- [x] 确认 manifest description 不超过当前浏览器限制。
- [x] 确认 Firefox summary 不超过 250 字符。
- [x] 确认 Edge 每个语言的长描述在 250 到 10,000 字符之间。
- [x] 确认没有 Markdown 语法会在不支持 Markdown 的后台变成噪声。
- [x] 为纯文本后台保留无 Markdown 的可粘贴段落。
- [x] 搜索过时状态和旧路径：

```powershell
rg -n "blocked|deferred|registration|store-assets/(edge-logo|screenshot-options|small-promo)" STORE_LISTING.md docs store-assets
```

### 12.4 多语言 listing 决策

- [x] 确认 Chrome Web Store 只有在扩展包提供 `_locales` 时才会开放对应 localized listing。
- [x] 方案判定：
  - [x] **采用方案**：为 Chromium 包加入 `default_locale`、`_locales/en/messages.json` 和 `_locales/zh_CN/messages.json`，让中英文 listing 能独立配置。
  - [x] **简化方案未采用，已判定 N/A**：首发只使用一个默认 listing 语言。
- [x] 推荐方案实施结果：
  - [x] manifest 的 name / description 改用 `__MSG_...__`。
  - [x] 验证 Chrome 与 Edge 都能解析默认语言。
  - [x] 确认 UI 内部语言切换不受影响。
  - [x] 扩展构建脚本把 `_locales` 纳入包。
- [x] Firefox AMO 的 listing 翻译单独在 AMO 后台配置；不假设 Chrome locale 自动同步过去。

**阶段出口条件**

- [x] 两种语言均可直接复制到后台。
- [x] 所有描述与最终运行时事实一致。
- [x] 多语言发布策略明确，不存在“准备了中文图但后台没有中文 locale”的悬空状态。

## 13. 阶段 4：完善隐私政策与平台数据声明

### 13.1 重写共用隐私政策的结构

`PRIVACY.md` 已包含：

- 生效 / 更新日期。
- 产品目的和本机-only 边界。
- 处理的数据逐项列表。
- 自动触发和手动触发方式。
- 本机端口和 token 的处理。
- 发送目的地。
- 浏览器扩展 storage 与 Patina 本地存储的区别。
- 数据保留和删除控制。
- 私密窗口处理。
- Chromium / Firefox 差异。
- 不读取、不出售、不共享、不用于广告或分析的数据。
- 用户如何停用、清除设置和卸载。
- 支持 / 隐私联系入口。

- [x] 保持一份共用政策，不为普通浏览器差异复制三份政策。
- [x] 提供英语法律事实主版本和等价简体中文说明。
- [x] 披露 token 存在扩展本地 storage，并作为本机请求的 Authorization header 使用。
- [x] 披露完整 URL（包括 path、query 和 fragment），以最终代码与导出契约为准。
- [x] 披露标题、favicon 和技术元数据的最终处理。
- [x] 说明数据不会发送给开发者、云服务或第三方服务器。
- [x] 不把 `localhost` 描述成“没有传输”；表述为“只传输到用户同一台电脑上的 Patina”。
- [x] 联系链接改为扩展仓库 Issues。

### 13.2 Chrome Web Store privacy practices

- [x] Single purpose 使用与 listing 相同的单一用途表述。
- [x] 为 `tabs`、`favicon`、`storage`、`alarms` 和两个本机 host permissions 分别准备理由。
- [x] Remote code 选择 No，并用包检查证明没有远程执行代码。
- [x] 最终数据类别：
  - [x] Authentication information：本机 bearer token。
  - [x] Web history / browsing activity：完整页面 URL。
  - [x] Website content：页面标题和网站图标信息。
  - [x] Search terms：Yes；完整 URL 查询参数可能包含搜索词。
  - [x] Technical / interaction data：Chromium 处理 client id、browser kind 和 extension version，按后台可用类别如实选择。
- [x] Limited Use 认证与隐私政策内容一致。
- [x] Privacy policy URL 使用公开仓库文件；真实提交前在未登录窗口再次检查。

### 13.3 Microsoft Edge Privacy

- [x] “是否访问、收集或传输个人信息”按真实行为选择 Yes。
- [x] 为 manifest 中每项权限准备最小权限理由。
- [x] Remote code 选择 No。
- [x] Data usage 选择与 Chrome 相同事实对应的 Edge 类别。
- [x] Privacy policy URL 使用同一共用政策。
- [x] Website URL 使用扩展仓库，不使用商店 listing 自身 URL。
- [x] Support contact 使用扩展仓库 Issues。

### 13.4 Firefox 数据披露一致性

- [x] manifest required / optional 数据类别与隐私政策逐项对应。
- [x] AMO listing 明确说出发送哪些数据、为什么发送、发到哪里。
- [x] AMO Privacy Policy 字段使用同一公开 URL。
- [x] 自动后台传输具有 Firefox 内置同意，不依赖“点击同步按钮”的隐式同意规则。
- [x] optional technical data 的允许 / 拒绝行为在隐私政策中说清楚。
- [x] optional technical data 的允许 / 拒绝行为在隐私政策中说清楚。

### 13.5 一致性反向检查

从每个声明反查代码：

- [x] “只连接本机”能够由 host permissions 和所有 fetch 目标证明。
- [x] “不读取正文”能够由没有 content scripts / scripting 权限证明。
- [x] “跳过私密窗口”能够由 background 早期返回证明。
- [x] “不使用远程代码”能够由包文件和 CSP 证明。
- [x] “不用于分析”能够由没有分析 SDK、远程 endpoint 和 telemetry 请求证明。
- [x] “用户可停止同步”能够由 Patina Web Sync 开关、清除扩展配置和卸载路径证明。

**阶段出口条件**

- [x] 三个平台数据选择可以从同一数据矩阵推导。
- [x] 隐私政策公开可读且没有遗漏 token 或自动传输。
- [x] 不存在“本地所以无需披露”的错误前提。

## 14. 阶段 5：重写审核员测试说明

### 14.1 准备无账号测试路径

- [x] 说明没有账号系统和测试登录。
- [x] 提供 Patina 桌面应用的公开下载 / 项目链接。
- [x] 说明审核环境需要 Windows 和本机 Patina。
- [x] 说明审核员应在自己的 Patina 中生成端口和 token，不向开发者索取真实凭据。
- [x] 指定公共测试页 `https://example.com/`，避免依赖登录网站或实时仓库状态。

### 14.2 正常配置和自动同步

- [x] 安装并打开 Patina。
- [x] 在 Patina Settings 中开启 Web Sync。
- [x] 复制端口和 token。
- [x] 在扩展 options 中填写并保存。
- [x] 明确说明保存后，扩展会自动同步当前普通活动网页。
- [x] 打开 `https://example.com/`，切换标签页或聚焦窗口触发自动同步。
- [x] 验证 popup 显示已同步。
- [x] 验证 Patina 本地记录出现网站上下文。
- [x] 另行验证“同步当前页”手动按钮。

### 14.3 网络与成功条件

- [x] 说明请求必须为 `POST /web-activity`。
- [x] 说明目标只能是 `127.0.0.1` 或 `localhost`。
- [x] 说明必须带 bearer token。
- [x] 说明只有 HTTP 成功且 JSON body 明确包含 `{ "ok": true }` 才显示成功。
- [x] 验证普通 `2xx`、非 JSON 或 `ok: false` 不会显示已同步。

### 14.4 隐私边界

- [x] 私密窗口：不发送、不显示域名或标题、不在 Patina 记录。
- [x] 浏览器内部页：不发送。
- [x] 缺少 token：显示待配置，不发送。
- [x] 错误端口：显示失败，不显示已同步。
- [x] Patina 关闭 Web Sync：显示未开启 / disabled。
- [x] Firefox optional technical data 拒绝：核心同步仍成功，技术字段不发送。
- [x] Firefox 安装提示：显示最终 required / optional 数据类型。

### 14.5 平台差异说明

- [x] Chrome / Edge：解释 `favicon` 权限来自浏览器本地 favicon cache。
- [x] Firefox：说明不请求 `favicon`，使用 tab 提供的图标元数据。
- [x] Firefox：说明最低支持版本和内置数据同意。
- [x] Edge：说明使用 Chromium-family package，但截图若提供必须来自 Edge。

**阶段出口条件**

- [x] 一位没有项目背景的人可以只看文档完成审核。
- [x] 自动同步、手动同步、失败、私密和浏览器差异都有明确预期结果。
- [x] 文档没有真实 token、开发者个人资料或只能内部访问的链接。

## 15. 阶段 6：整理和重新验证商店素材

### 15.1 目录与命名

- [x] Chrome 成品只放 `store-assets/chrome-web-store/`。
- [x] Firefox 成品只放 `store-assets/firefox-amo/`。
- [x] Edge 成品只放 `store-assets/edge-add-ons/`。
- [x] 原图和旧图只放 `store-assets/source/`。
- [x] 文件名包含平台、用途、locale 和尺寸中必要的信息。
- [x] `store-assets/README.md` 只引用当前实际存在的文件。

### 15.2 自动尺寸检查

- [x] 添加或扩展脚本，逐个读取 PNG 尺寸并验证：
  - [x] Chrome icon：`128x128`。
  - [x] Chrome screenshots：`1280x800`，最多 5 张。
  - [x] Chrome small promo tile：`440x280`。
  - [x] Edge logo：推荐 `300x300`，不得小于 `128x128`。
  - [x] Edge screenshots：若提供，只能为 `1280x800` 或 `640x480`，最多 6 张。
  - [x] Edge small promo tile：若提供，为 `440x280`。
  - [x] Firefox screenshots：优先 `1280x800` 或同等 `1.6:1` 比例。
- [x] 把稳定尺寸检查接入 `npm run check` 或单独的 `npm run check:store-assets`，并由 `npm run release:check` 调用。

### 15.3 截图内容 QA

对每张计划上传的截图逐项检查：

- [x] 来自当前候选版本，而不是旧 UI。
- [x] 没有真实 token；token 使用明确的测试值并始终遮罩。
- [x] 没有真实邮箱、手机号、地址、账号菜单、通知或私人标签页。
- [x] 没有开发者登录头像或可识别浏览器 profile。
- [x] 没有实时 star 数、Issue 数等容易过时且与功能无关的信息。
- [x] options 的端口、token 和“已保存”状态相互一致。
- [x] popup 的已同步状态对应一个普通公共测试页。
- [x] 图片没有拉伸、黑边、模糊、错误裁切或意外透明区域。
- [x] 文字在商店缩略图中仍可辨认。
- [x] 中文图和英文图展示同一功能状态。
- [x] 不用 Chrome 浏览器外观冒充 Edge 截图。

### 15.4 建议重新截图集合

- [x] Chrome English options：假端口 `12345`、完整遮罩假 token、Saved。
- [x] Chrome 简体中文 options：与英文相同配置状态、已保存。
- [x] Chrome English popup：在 `https://example.com/` 上显示 Synced。
- [x] Chrome 简体中文 popup：同一测试页和状态。
- [x] Firefox English options：与 Chrome 一致的测试配置。
- [x] Firefox 简体中文 options：与英文一致的测试配置。
- [x] 如需要 Firefox popup，再补同一公共测试页的英文或无语言歧义截图。
- [x] Edge 首发若截图不是后台必填，保持不上传；如果决定上传，必须在 Edge 中重新捕获。

### 15.5 宣传图和图标 QA

- [x] 图标与 manifest 包内图标来源一致。
- [x] Promo tile 不使用 Google、Firefox 或 Microsoft 商标制造官方背书误解。
- [x] Promo tile 只表达产品名和本机同步用途，不堆叠营销词。
- [x] 确认背景、文字和图标在浅色 / 深色商店界面都保持清晰。
- [x] 记录源文件和导出方式，保证未来可重建。

### 15.6 平台上传选择

- [x] Chrome：上传 icon、至少一张截图和 small promo tile；marquee 与视频按当前后台要求决定。
- [x] Firefox：上传能解释核心功能的少量截图，避免无意义堆图。
- [x] Edge：每个 listing 语言提供 logo；small tile 和截图按当前后台必填状态决定。
- [x] 不因“文件已经存在”就默认上传所有可选素材。

**阶段出口条件**

- [x] 每个上传文件都有明确平台、locale、用途和尺寸。
- [x] 所有截图经过人工视觉检查和自动尺寸检查。
- [x] 不存在登录状态、个人信息、真实 token 或误导状态。

## 16. 阶段 7：形成三平台字段对照

### 16.1 Chrome Web Store

- [x] Package：Chromium `0.2.0` 候选 zip，或版本门判定后的新版本。
- [x] Name：来自 manifest / locale messages。
- [x] Short description：来自 manifest / locale messages。
- [x] Detailed description：从 `STORE_LISTING.md` 对应 locale 复制。
- [x] Category：Productivity。
- [x] Language / localized listings：与 `_locales` 决策一致。
- [x] Store icon：`128x128`。
- [x] Screenshots：至少一张 `1280x800`，不超过 5 张。
- [x] Small promo tile：`440x280`。
- [x] Homepage URL：扩展仓库或专门项目页。
- [x] Support URL：扩展仓库 Issues。
- [x] Mature content：No。
- [x] Single purpose、permission justifications、remote code、data usage、privacy URL 已填写。
- [x] Distribution：默认公开范围和地区选择已单独确认。
- [x] 首次审核优先使用 deferred publishing，如果当前后台提供。

### 16.2 Firefox AMO

- [x] Distribution：`On this site`，作为公开 listed add-on。
- [x] Package：Firefox zip / xpi 上传包，根目录直接包含 manifest。
- [x] 稳定 id：`web-sync@patina.local`。
- [x] Version：严格高于 AMO 已接受的最高版本。
- [x] Compatible platform：Desktop；产品依赖 Windows Patina。
- [x] Name：Patina Web Sync。
- [x] Summary：不超过 250 字符。
- [x] Description：明确自动本机同步和数据传输。
- [x] Experimental：No。
- [x] Requires payment / non-free service：No；Patina 是免费的本机依赖。
- [x] Categories：最多 2 个，首选 Productivity 或 AMO 当前最接近类别。
- [x] Support website：扩展仓库 Issues。
- [x] License：MIT。
- [x] Privacy policy：Yes，并填写共用政策 URL。
- [x] Notes for Reviewers：使用已验证的审核说明。
- [x] Source code：当前包未压缩、未混淆、未 bundle；按后台问题如实选择。
- [x] 如果 AMO 要求源码包，提供仓库源码和可复现命令，不提交 secrets 或生成物。
- [x] 不运行 unlisted signing helper 代替 listed submission。

### 16.3 Microsoft Edge Add-ons

- [x] Package：与 Chrome 共用经过验证的 Chromium-family zip，除非 Edge validator 要求专属变体。
- [x] Availability：Public / Hidden 和市场范围已单独确认。
- [x] Category：Productivity。
- [x] Privacy：选择访问 / 传输个人信息，并填写共用政策 URL。
- [x] Permission justifications：逐项填写。
- [x] Remote code：No。
- [x] Data usage：与数据矩阵一致。
- [x] Website URL：扩展项目页。
- [x] Support：扩展仓库 Issues 或长期邮箱。
- [x] Mature content：No。
- [x] 每个语言的 Description：250 到 10,000 字符。
- [x] 每个语言的 logo：`300x300` 推荐尺寸。
- [x] Short description：来自 manifest，至少一个语言存在。
- [x] Small promotional tile：当前后台若需要则上传 `440x280`。
- [x] Screenshots：可选；若上传则使用 Edge 专属 `1280x800` 或 `640x480` 图。
- [x] Search terms：只使用少量准确词，不进行关键词堆叠。

**阶段出口条件**

- [x] 三个平台每个字段都能定位到唯一的仓库事实来源。
- [x] 没有需要临时现场创作文案的必填字段。
- [x] 可选字段已经明确“上传”或“首发省略”，不存在模糊状态。

## 17. 阶段 8：更新长期文档和变更记录

- [x] 更新 `docs/store-submission.md`：
  - [x] 删除 Edge 账号阻塞旧状态。
  - [x] 记录三平台当前准备边界。
  - [x] 记录 Firefox 内置数据同意规则。
  - [x] 记录多语言 listing 与 `_locales` 的关系。
- [x] 更新 `docs/engineering-quality.md`：
  - [x] 增加 Firefox data collection manifest 不变量。
  - [x] 增加 store asset 自动检查不变量。
  - [x] 增加 listing / privacy / runtime 一致性要求。
- [x] 更新 `docs/versioning-and-release-policy.md`：
  - [x] 明确 AMO listed 和 unlisted 的版本安全边界。
  - [x] 明确真正上传前检查 AMO 已接受最高版本。
- [x] 如 payload 发生变化，更新 `docs/web-activity-protocol.md`。
- [x] 如长期目录结构变化，更新 `docs/architecture.md`。
- [x] 更新 `store-assets/README.md`，只保留当前成品与来源说明。
- [x] 更新 `CHANGELOG.md`：
  - [x] 只记录会影响用户隐私提示、最低 Firefox 版本、payload、manifest 或发布工件的结果。
  - [x] 不把纯文档整理、图片移动或计划创建写成用户发布条目。
  - [x] 候选变更继续留在 `[Unreleased]`，直到真实发布事实成立。

**阶段出口条件**

- [x] 一次性方案没有成为长期规则的唯一存放位置。
- [x] 所有稳定新约束已经进入相应顶层长期文档或验证脚本。

## 18. 阶段 9：本地验证与发布包审计

### 18.1 静态检查

- [x] 运行：

```powershell
npm run check
```

- [x] 确认版本一致性通过。
- [x] 确认 Chromium 权限、host permissions、CSP、入口、私密过滤和成功响应检查通过。
- [x] 确认 Firefox 权限、Gecko id、数据同意、最低版本和技术数据授权检查通过。
- [x] 确认商店素材路径与尺寸检查通过。

### 18.2 打包检查

- [x] 运行：

```powershell
npm run release:check
```

- [x] 确认生成 Chromium zip。
- [x] 确认生成 Firefox 未签名开发 zip。
- [x] 确认命令没有执行 AMO 签名。
- [x] 记录两个文件的完整路径、字节数和 SHA-256。

### 18.3 包内容审计

对两个包分别确认：

- [x] zip 根目录直接包含 `manifest.json`。
- [x] 没有 `.git`、`.github`、`.agents`、`node_modules`、`dist` 或 release artifact 嵌套。
- [x] 没有 `.secrets`、token、API key、邮箱配置或本机绝对路径。
- [x] 没有不需要的源图或商店图片。
- [x] 没有远程代码或远程依赖。
- [x] manifest 版本与文件名一致。
- [x] 包内图标、popup、options 和 background 入口均存在。

### 18.4 本地行为回归

- [x] Chromium 正常网页自动同步。
- [x] Chromium 手动同步。
- [x] Chromium 私密窗口跳过。
- [x] Chromium 内部页面跳过。
- [x] Chromium 错误端口和错误 token 不显示成功。
- [x] Firefox 正常网页自动同步。
- [x] Firefox 手动同步。
- [x] Firefox 私密窗口跳过。
- [x] Firefox 内部页面跳过。
- [x] Firefox 数据同意允许路径。
- [x] Firefox optional 技术数据拒绝路径。
- [x] Firefox 错误端口和错误 token 不显示成功。

### 18.5 文案反向回归

- [x] 逐句检查长描述中的每个能力都能在当前包中复现。
- [x] 逐句检查隐私政策中的每个否定承诺都有代码证据。
- [x] 逐项检查权限理由与 manifest 精确对应。
- [x] 逐项检查数据类别与最终 payload 精确对应。
- [x] 逐张检查截图与当前包 UI 一致。

**阶段出口条件**

- [x] 所有自动检查通过。
- [x] 所有人工隐私和行为回归通过。
- [x] 两个上传包的 hash 和内容清单已记录。

## 19. 阶段 10：形成上架任务交接包

### 19.1 共用交接内容

- [x] 候选版本号。
- [x] Chromium package 路径和 SHA-256。
- [x] Firefox package 路径和 SHA-256。
- [x] Privacy policy URL。
- [x] Reviewer instructions URL。
- [x] `en-US` 和 `zh-CN` 可粘贴文案位置。
- [x] 每个平台素材目录。
- [x] 权限理由和数据类别选择。
- [x] 官方规则最后复核日期。
- [x] 已知非阻塞项和真正阻塞项。

### 19.2 Chrome 交接

- [x] 指定上传 zip。
- [x] 指定默认和本地化 listing 文案。
- [x] 指定截图顺序。
- [x] 指定 privacy practices 选择。
- [x] 指定 deferred publishing 策略。

### 19.3 Firefox 交接

- [x] 指定 AMO 已接受最高版本和目标版本。
- [x] 指定 `On this site`。
- [x] 指定 data collection permissions。
- [x] 指定 source code 回答和重建命令。
- [x] 指定 reviewer notes。
- [x] 明确不得用 unlisted signing helper 替代 listed submission。

### 19.4 Edge 交接

- [x] 指定 Chromium package。
- [x] 指定 availability / markets 待用户确认项。
- [x] 指定 Properties / Privacy 填写内容。
- [x] 指定各语言 logo 和描述。
- [x] 明确首发是否省略 Edge screenshot。

**阶段出口条件**

- [x] 三个发布任务不需要重新研究共用事实。
- [x] 三个发布任务只需处理后台输入、validator 结果和审核反馈。

## 20. Go / No-Go 总表

### 20.1 共用资料

- [x] GO：数据矩阵完成。
- [x] GO：中英文文案完成。
- [x] GO：隐私政策完成并公开可访问。
- [x] GO：审核说明完成。
- [x] GO：素材 QA 完成。
- [x] GO：`npm run check` 通过。
- [x] GO：`npm run release:check` 通过。

共用资料结论：`[x] GO  [ ] NO-GO`

阻塞原因：

```text
无共用资料阻塞。真实上传、后台重新登录、市场范围、提交审核和发布属于各商城独立外部任务。
```

### 20.2 Chrome Web Store

- [x] GO：Chromium zip 验证通过。
- [x] GO：listing locale 策略可执行。
- [x] GO：必要图片完整。
- [x] GO：privacy practices 有唯一答案。
- [x] GO：无后台 blocker / warning 未解释。

Chrome 结论：`[x] GO  [ ] NO-GO`

### 20.3 Firefox AMO

- [x] GO：版本严格前进。
- [x] GO：manifest 数据同意正确。
- [x] GO：Firefox 142+ 行为验证通过。
- [x] GO：listed package 通过本地 lint。
- [x] GO：reviewer notes 和 source 回答完整。

Firefox 结论：`[x] GO  [ ] NO-GO`

### 20.4 Microsoft Edge Add-ons

- [x] GO：账号已授权。
- [x] GO：Chromium zip 通过 Edge 本地验证。
- [x] GO：每个语言的描述和 logo 完整。
- [x] GO：privacy / permission reasons 完整。
- [x] GO：可选截图策略明确。

Edge 结论：`[x] GO  [ ] NO-GO`

## 21. 风险与应对

| 风险 | 早期信号 | 应对 |
| --- | --- | --- |
| 覆盖用户现有素材改动 | 工作区已有同名修改或删除 | 修改前阅读 diff，只追加或合并，不 reset |
| Firefox 重复签名版本 | AMO 已存在相同 manifest version | 查询 AMO 最高版本，必要时统一 bump |
| Firefox 数据声明不完整 | validator 提示 data collection / consent | 以数据矩阵补 manifest、运行时授权和政策 |
| 完整 URL 包含查询参数 | 测试 URL 含 `?q=` 等内容 | 完整 URL 是导出契约；限制为本机传输，披露 browsing activity / search terms，并保持私密窗口发送前过滤 |
| optional 技术数据仍被无条件发送 | background 不检查 data permission | 把授权检查放到 payload 构造前并加测试 |
| Chrome 中文 listing 无法选择 | 包内没有 `_locales/zh_CN` | 实现 locale 或明确首发单语言 |
| Edge 使用 Chrome 截图 | 截图出现 Chrome chrome / URL | 首发省略可选截图或在 Edge 重拍 |
| 图片状态误导 | “已保存”与空配置同时出现 | 用统一假配置重拍并人工 QA |
| 隐私政策 URL 不可访问 | 未登录窗口 404 或需要权限 | 使用公开稳定 URL，提交前再次检查 |
| 文案与自动同步不一致 | listing 只描述点击按钮 | 明确披露后台事件和周期性同步 |
| 商店规则变化 | 后台必填项不同 | 记录日期，以当前后台和官方文档为准 |
| 计划长期留在顶层 docs | 任务完成后仍在 `docs/working` | 完成时移到 `docs/archive/` |

## 22. 回滚原则

- 文案或素材错误：只回滚对应资料，不回滚已验证的隐私修复。
- manifest 数据声明错误：停止上传，修正 manifest 和验证脚本；如果版本已被 AMO 接受，使用更高版本。
- 运行时数据最小化导致兼容问题：停止候选发布，恢复兼容 payload 或先更新 Patina 接收端；不得通过虚假文案掩盖。
- 商店后台草稿错误：保留草稿或撤回提交，不公开发布。
- 任何疑似秘密进入截图或包：立即 NO-GO，重新生成素材或包，并废弃原工件。

禁止使用破坏性 git 命令来“快速回滚”整个工作区。

## 23. 执行结果

完成勾选、验证证据、候选包哈希和归档后的完整 URL 契约纠正记录见 [`three-store-shared-listing-materials-execution-record-2026-07-10.md`](./three-store-shared-listing-materials-execution-record-2026-07-10.md)。
