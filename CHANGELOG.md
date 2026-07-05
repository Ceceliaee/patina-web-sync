# Changelog

本文件记录 Patina Web Sync 的版本发布说明。

只记录已经进入发布结果、影响用户安装或维护发布判断的变化；日常仓库维护不写入本文件。

## [Unreleased]

Release: 待定。

### Added

### Changed

### Fixed

### Removed

### Internal

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
