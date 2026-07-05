# 版本与发布策略

## 版本来源

Patina Web Sync 是公开 GitHub 仓库，但目前不发布为 npm 包。除非 npm 发布成为明确目标，否则保持 `package.json` 的 `"private": true`。

项目版本应在以下来源中保持一致。`npm run check:versions` 会在本地和 CI 中强制检查：

- `package.json` 的 `version`
- `src/chromium/manifest.json` 的 `version`
- `src/firefox/manifest.json` 的 `version`
- Git tag `vX.Y.Z`
- GitHub Release 标题 `Patina Web Sync vX.Y.Z`

独立仓库初始版本为 `0.1.1`，它匹配当前 Firefox 扩展版本，并把 Chromium 提升到同一版本。浏览器扩展版本使用数字 `X.Y.Z` 或 `X.Y.Z.N` 格式。

## 浏览器版本规则

Chromium 和 Firefox manifest version 通常应一起前进。如果浏览器专属紧急情况要求只发布某个目标，打 tag 前先在 `CHANGELOG.md` 中记录原因。

Firefox 版本需要额外谨慎。同一个稳定 Gecko id `web-sync@patina.local` 一旦签名过某个版本，不要回退该 manifest version。

不要为了验证迁移或普通文档变更而运行 AMO 签名。只有在准备真实 Firefox 发布，并确认目标版本向前移动后，才运行 `npm run extension:firefox:sign`。

## 验证

默认验证：

```bash
npm run check
```

准备 release asset 前，还要运行：

```bash
npm run release:check
```

`npm run release:check` 会生成本地 Chromium 包和未签名 Firefox development 包。它不会执行 AMO 签名。

## Release 附件

Chromium release asset：

```text
patina-chromium-extension-vX.Y.Z.zip
```

Firefox release asset：

```text
patina-firefox-extension-vX.Y.Z.xpi
```

正式 release 中的 Firefox `.xpi` 必须由 AMO 签名产出。未签名 Firefox zip 只是开发 artifact，不应作为面向用户的 release asset 附加。

## 发布流程

1. 更新 `CHANGELOG.md`。
2. 确认 `package.json` 和两个浏览器 manifest 都使用目标版本。
3. 运行 `npm run check`。
4. 运行 `npm run release:check` 做本地打包验证。
5. 发布 Firefox asset 前，确认 GitHub repository secrets 已配置 AMO 凭据。
6. 提交 release preparation 变更。
7. 推送 tag `vX.Y.Z`，或针对已有版本 tag 运行 release workflow。
8. 让 GitHub Actions 校验版本一致性、打包 Chromium、签名 Firefox、收集 assets 并发布 GitHub Release。如果 `vX.Y.Z` 已存在，workflow 会跳过发布，避免再次签同一个 Firefox manifest version。

## 与 Patina Release 的关系

Patina 桌面 release 不打包或上传 Patina Web Sync 浏览器扩展 asset。

Patina README 和 Patina Settings 可以链接到本仓库 release 页面或未来浏览器商店入口。除非协议兼容性变化需要协调，否则扩展发布节奏应独立于 Patina 桌面应用。
