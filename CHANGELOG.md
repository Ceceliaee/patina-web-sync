# Changelog

本文件是版本说明的唯一来源。

格式遵循仓库内的 [`docs/versioning-and-release-policy.md`](docs/versioning-and-release-policy.md)。

每个正式版本应同时维护：

- `Release:` 给 GitHub Release 使用的简短摘要。
- 分类条目保留完整版本记录，供后续追溯和维护使用。

## [Unreleased]

### Added

- 新增西班牙语 Español，覆盖 Popup、Options、状态、错误及扩展描述。Refs [patina#76](https://github.com/Ceceliaee/patina/issues/76)

- 为简体中文和英语建立唯一语言事实源、确定性目标生成与审核哈希，并覆盖 Popup、Options、manifest、状态、错误和无障碍名称。

### Changed

- Popup 与 Options 改由两个浏览器目标共享实现；语言选择使用规范 locale，并补齐完整键盘菜单、焦点恢复和动态状态播报。
- 后台和浏览器 storage 改为保存稳定状态码、错误码与结构化参数，切换语言会立即按当前语言重新解释状态。
- 开发与 CI 统一使用仓库固定的 Node、npm 和类型定义版本。

### Fixed

- 非 JSON 成功响应、空响应、显式拒绝、HTTP 错误和网络异常不再被误判为同步成功，并使用可操作的本地化错误。
- 商店长期文案不再保留已经过期的 `0.2.0` 审核中状态，版本证据改为独立记录。

### Internal

- 验证矩阵覆盖两个浏览器目标的隐私、optional technical data、响应失败、storage 迁移、本地化硬编码、目标一致性和包确定性。
- GitHub Release 改为内容不可变、动作可恢复：相同资产复用、缺失资产补齐、哈希冲突失败，并增加校验和、attestation 与远端回读。
- 本地 release check 现在会真正校验调用者传入的候选版本，避免参数被脚本链末端静默吞掉。
- 正确识别 Patina 主应用返回的 HTTP 409 + `web-recording-disabled`，避免把“网页同步未开启”误报为通用 HTTP 错误。

## [0.2.0] - 2026-07-23

Release: Patina Web Sync 0.2.0 是首个三家浏览器商店正式版本，补齐私密窗口过滤、成功响应校验和上架材料。

### Added

- 补充浏览器商店上架用的共用隐私政策。
- 补充审核员测试说明，覆盖本机 Patina 配置、普通网页同步、私密窗口跳过和错误状态。
- 补充浏览器商店提交参考，以及 Firefox AMO / Microsoft Edge Add-ons 商店页文案草稿。
- 为 Chromium 与 Firefox manifest 增加英语和简体中文 locale messages，支持商店本地化 listing。
- Firefox 142+ 使用内置数据同意声明，核心鉴权、浏览活动、可能包含在完整 URL 查询中的搜索词和网站内容为 required，本机技术与交互数据为 optional。

### Changed

- 将项目版本与两个扩展 manifest 版本更新到 `0.2.0`。
- 扩展会在发送本机网页同步请求前跳过无痕 / 私密标签页。
- 保留当前活动页面的完整 URL（包括 path、query 和 fragment），使 Patina 可以在本机保存并导出“URL 地址”。
- Firefox 最低支持版本调整为 142，以使用浏览器内置数据同意并通过桌面 / Android compatibility validator；拒绝可选技术数据不会影响核心同步。

### Fixed

- 弹窗和选项页只有在本机桥接响应明确返回 `ok: true` 后，才会显示为已同步。

### Removed

- 移除扩展本地伪造的 `enabled` 状态，让 Patina 桌面端继续作为网页同步是否启用的来源。
- 从新 payload 中移除 tab/window ID、采集时间和事件原因等非必要技术字段。

### Internal

- 扩展校验现在覆盖精确权限、本机主机权限、空可选权限、空内容脚本、无痕 / 私密过滤和 `ok: true` 成功响应。
- 扩展校验现在覆盖完整 URL 传输、Firefox 数据同意、manifest locales 和商店素材尺寸；生成 zip 的根目录直接包含 `manifest.json`。
- README 中的发布附件示例改用版本占位符，避免保留旧的 `v0.1.0` 文件名。
- 发布流程新增版本一致性校验；三家商店公开后，Tag 工作流从 AMO 获取同版本公开 listed XPI，并与 Chromium zip 一次性发布 GitHub Release。

## [0.1.1] - 2026-07-05

Release: Patina Web Sync 作为独立伴生扩展首次发布，提供 Chromium zip 与 Firefox 签名 XPI。

### Added

- 首次独立发布 Patina Web Sync 伴生扩展，用于把浏览器前台网页活动写入 Patina 本机接收端。
- 发布 Chromium 系 zip 与经 AMO 签名的 Firefox 系 `.xpi` 安装包。

### Changed

- Chromium 和 Firefox 扩展版本统一为 `0.1.1`，并与独立仓库首个 GitHub Release 对齐。

### Fixed

### Removed

### Internal
