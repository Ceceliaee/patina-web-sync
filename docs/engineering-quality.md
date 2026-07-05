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

如果改动触及 manifests、package scripts、release workflow、签名、打包或 asset 命名，还要运行：

```bash
npm run release:check
```

`release:check` 可以生成本地 package artifact，但不得执行 AMO 签名。

## 浏览器扩展不变量

验证和 review 应保护以下不变量：

- 每个目标的 `manifest_version` 保持在受支持的扩展平台版本。
- host permissions 继续限制在 `http://127.0.0.1/*` 和 `http://localhost/*`。
- Content security policy 不新增远程 fetch 目标。
- Chromium-only API 和权限留在 Chromium 目标内。
- Firefox 保持 `browser_specific_settings.gecko.id` 为 `web-sync@patina.local`。
- Firefox 不请求 `favicon` 等 Chromium-only 权限。
- 两个目标都保留有效的 popup、options、icons 和 background 入口。

## 隐私与数据处理

不得添加读取页面正文、表单内容、密码、截图、剪贴板、cookie、下载历史或浏览器历史数据库的能力。

扩展应只发送 Patina 需要的活动标签页元数据。如果未来变化需要更多数据，先记录用户收益、隐私成本、浏览器权限和 Patina 接收端兼容性，再开始实现。

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

## 代码变更风格

优先使用直接、可读的 JavaScript 和 TypeScript。这个仓库刻意保持紧凑，因此不要引入框架迁移、bundler 或共享基础设施，除非它们解决具体维护问题。

脚本的失败信息要足够具体，让未来维护者知道哪个文件或不变量坏了。

UI 文件保持行为简单，不引入远程依赖。扩展页面应能在当前 content security policy 下工作。

## 文档质量

当某条质量规则变成长期规则时，更新相关长期文档，而不是只留在临时计划或 commit message 里。

`AGENTS.md` 用于仓库级协作规则。本文用于指导实现和 review 的工程质量规则。
