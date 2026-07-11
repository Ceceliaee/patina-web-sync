# 工程质量

## 目的

本文定义 Patina Web Sync 作为小型浏览器扩展伴生项目的质量门槛。

这里的质量指：保护隐私边界、保持浏览器目标可预期、让发布失败在签名前暴露，并避免不必要的项目重量。

## 核心质量原则

- 默认保持本机-only 和隐私保护。
- 对稳定不变量，优先用显式验证脚本，而不是依赖 reviewer 记忆。
- 除非浏览器 API 强制分化，保持 Chromium 和 Firefox 行为一致。
- 让发布步骤可重复、版本感知，并在 Firefox AMO 签名周围保持安全。
- 保持仓库小而清楚。只有在减少真实重复或编码稳定边界时才增加抽象。

## 必要验证

提交前默认验证：

```bash
npm run check
```

该命令必须覆盖：

- `package.json` 和两个 manifest 的版本一致性
- Chromium 扩展结构和权限检查
- Firefox 扩展结构、权限和 Gecko id 检查
- Firefox AMO `web-ext lint --warnings-as-errors` 检查
- Firefox 142+ data collection permissions 与运行时 optional consent 门
- 三个平台商店素材的 PNG 尺寸、数量和文档路径检查

如果改动触及 manifests、package scripts、release workflow、签名、打包或 asset 命名，还要运行：

```bash
npm run release:check
```

`release:check` 可以生成本地 package artifact，但不得执行 AMO 签名。

## 浏览器扩展不变量

验证和 review 应保护以下不变量：

- 每个目标的 `manifest_version` 保持在受支持的扩展平台版本。
- host permissions 继续限制在 `http://127.0.0.1/*` 和 `http://localhost/*`。
- permissions 和 host permissions 使用精确 allowlist；不得静默接受额外权限。
- `optional_permissions` 和 `optional_host_permissions` 必须为空或缺失。
- `content_scripts` 必须为空或缺失；该扩展不读取页面正文。
- Content security policy 不新增远程 fetch 目标。
- Chromium-only API 和权限留在 Chromium 目标内。
- Firefox 保持 `browser_specific_settings.gecko.id` 为 `web-sync@patina.local`。
- Firefox 保持 `strict_min_version: "142.0"`；required 数据类型精确为 `authenticationInfo`、`browsingActivity`、`searchTerms`、`websiteContent`，`technicalAndInteraction` 只能 optional。
- Firefox 用户拒绝 optional 技术数据时，核心同步必须继续，payload 不得包含 browser client id、browser kind 或 extension version。
- Firefox 不请求 `favicon` 等 Chromium-only 权限。
- 两个目标的 manifest name 和 description 使用英语 / 简体中文 `_locales`，构建包必须包含对应 message 文件。
- 两个目标都保留有效的 popup、options、icons 和 background 入口。
- background 必须在构造 payload、解析 favicon 或发送本机 HTTP request 前跳过 incognito/private 标签页。
- 普通 `http` / `https` payload 可以继续携带协议 v1 的 `incognito: false` 字段，以保持 Patina 接收端兼容。
- background 必须保留普通活动页面的完整 URL，使 path、query 和 fragment 可进入本机 Patina 数据导出。
- 新 payload 不发送 tab/window ID、采集时间或事件原因。Patina 可以兼容旧字段，但不能依赖它们。
- 本机 bridge 响应必须显式满足协议成功 shape：HTTP status 成功且 JSON response body 包含 `ok: true`，才可显示为已同步。

## 隐私与数据处理

不得添加读取页面正文、表单内容、密码、截图、剪贴板、cookie、下载历史或浏览器历史数据库的能力。

扩展应只发送 Patina 需要的活动标签页元数据。如果未来变化需要更多数据，先记录用户收益、隐私成本、浏览器权限和 Patina 接收端兼容性，再开始实现。

完整 URL 是明确的产品与导出契约。扩展只对 scheme 做 `http` / `https` 验证，不裁剪 path、query 或 fragment；隐私边界由本机-only 目标、bearer token、私密窗口发送前过滤、公开披露和用户控制共同保证。测试必须证明完整 URL 原样进入 payload，并将查询参数可能包含的 search terms 纳入商店声明。

incognito/private 标签页属于更高隐私等级的浏览器上下文。扩展读取到 `tab.incognito === true` 后，应只记录本地同步状态，不得把该标签页的 URL、title、favicon URL 或 favicon data 发送到 Patina bridge。Patina 接收端仍应保留忽略 incognito payload 的后备逻辑，以兼容旧扩展或异常客户端。

本地连接 secret 是 Patina bearer token。不要记录、提交或发送到除本机 Patina bridge 请求以外的任何地方。

## 跨浏览器一致性

改动通常应保持 Chromium 和 Firefox 用户行为一致。

当行为必须分化时：

- 在实现或 release notes 中记录浏览器 API 或商店政策原因
- 保持共享协议 payload 兼容
- 保持面向用户的设置说明在浏览器目标之间一致
- 如果该差异成为稳定不变量，更新验证脚本

## 发布质量

发布改动必须防止签名或发布错误版本：

- 打包或发布前，`npm run check:versions` 必须通过。
- Git tag、package version、Chromium manifest version、Firefox manifest version、release title 和 asset 名称必须一致。
- AMO 已接受某个 Firefox manifest version 后，不要再次签同一个版本。
- 不要把未签名 Firefox zip 作为面向用户的 release asset 发布。
- 不要把 `dist/`、`dist-release/` 和 `web-ext-artifacts/` 生成物提交进 git。
- Chrome 和 Firefox zip 根目录必须直接包含 `manifest.json`，不得额外包一层版本目录。
- 商店成品只放对应的 `store-assets/<store>/`；`source/` 不直接上传。
- `npm run check:store-assets` 必须阻止错误尺寸、超量截图、过时素材路径和错误支持链接。
- listing、隐私政策、审核说明、manifest 数据声明和真实 payload 是同一事实的不同表示；任何一处变化都要反向检查其余来源。

## 代码变更风格

优先使用直接、可读的 JavaScript 和 TypeScript。这个仓库刻意保持紧凑，因此不要引入框架迁移、bundler 或共享基础设施，除非它们解决具体维护问题。

脚本的失败信息要足够具体，让未来维护者知道哪个文件或不变量坏了。

UI 文件保持行为简单，不引入远程依赖。扩展页面应能在当前 content security policy 下工作。

## 文档质量

当某条质量规则变成长期规则时，更新相关长期文档，而不是只留在临时计划或 commit message 里。

`AGENTS.md` 用于仓库级协作规则。本文用于指导实现和 review 的工程质量规则。
