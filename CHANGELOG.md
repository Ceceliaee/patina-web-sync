# Changelog

本文件是版本说明的唯一来源。

格式遵循仓库内的 [`docs/versioning-and-release-policy.md`](docs/versioning-and-release-policy.md)。

每个正式版本应同时维护：

- `Release:` 给 GitHub Release 使用的简短摘要。
- 分类条目保留完整版本记录，供后续追溯和维护使用。

## [Unreleased]

Release: 待定。

### Added

### Changed

- Incognito/private browser tabs are now filtered in the extension before any local Web Sync request is sent.

### Fixed

- Web Sync now requires the local bridge response to explicitly return `ok: true` before the popup/options state can show as synced.

### Removed

- Removed the extension-local fake `enabled` storage state so Patina desktop remains the source of truth for whether Web Sync is enabled.

### Internal

- Extension validation now enforces exact permissions, exact local host permissions, empty optional permissions, empty content scripts, private-tab filtering, and explicit `ok: true` bridge success handling.
- Target README artifact examples now use version placeholders instead of stale `v0.1.0` file names.
- 发布流程新增版本一致性校验，并在目标 GitHub Release 已存在时跳过发布，避免重复签名同一个 Firefox manifest version。

## [0.1.1] - 2026-07-05

Release: Patina Web Sync 作为独立 companion extension 首次发布，提供 Chromium zip 与 Firefox 签名 XPI。

### Added

- 首次独立发布 Patina Web Sync companion extension，用于把浏览器前台网页活动写入 Patina 本机接收端。
- 发布 Chromium-family zip 与经 AMO 签名的 Firefox-family `.xpi` 安装包。

### Changed

- Chromium 和 Firefox 扩展版本统一为 `0.1.1`，并与独立仓库首个 GitHub Release 对齐。

### Fixed

### Removed

### Internal
