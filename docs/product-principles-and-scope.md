# 产品原则与范围

## 目的

Patina Web Sync 是 Patina 的浏览器扩展伴生项目。它的职责很窄：观察浏览器中的当前活动网页，并把 Patina 需要的最小元数据发送给同一台电脑上运行的 Patina 桌面应用。

这个仓库存在的原因，是让浏览器扩展拥有独立的源码、验证、审核和发布节奏，而不让 Patina 桌面应用发布依赖浏览器商店流程。

## 产品边界

Patina Web Sync 的范围包括：

- Chromium 系浏览器扩展源码、打包和 release asset。
- Firefox 系浏览器扩展源码、打包、AMO 签名和 release asset。
- 用于配置本机 Patina 连接设置的扩展 options 和 popup UI。
- 通过 `127.0.0.1` 或 `localhost` 向 Patina 发送本机活动标签页元数据。
- 浏览器商店所需的扩展隐私说明和 listing 素材。

Patina Web Sync 的范围不包括：

- Patina 桌面应用运行时行为。
- Patina 本机 HTTP 接收端实现。
- Patina SQLite 存储、备份、恢复、清理、History、Data、Settings 或 Classification 读模型。
- 云同步、账号身份、团队空间、远程采集、分析服务或 SaaS 能力。
- 读取页面正文、表单内容、密码、截图、剪贴板、cookie、下载历史或浏览器历史数据库。

## 产品原则

- 保持本地优先。扩展只和用户自己电脑上的 Patina 应用通信，不和远程服务通信。
- 只发送必要的活动标签页元数据。更多数据就是更高的隐私成本，除非有明确的 Patina 用户收益。
- 让 Patina 控制记录行为。如果 Patina 关闭 Web Sync 或拒绝 token，扩展应展示该状态，而不是自创一套记录规则。
- 尽量保持浏览器目标一致。Chromium 和 Firefox 行为只有在浏览器 API 或商店要求强制时才分化。
- 尊重浏览器审核节奏。Firefox AMO 审核和浏览器商店更新可能慢于 Patina 桌面发布，因此 Patina 必须兼容近期发布过的扩展客户端。

## 决策规则

如果改动只影响扩展打包、浏览器 UI 或浏览器 API 处理，由本仓库拥有决策权。

如果改动影响持久化网页活动语义、endpoint 行为、token 规则、备份兼容性或 History / Classification 展示，由 Patina 仓库拥有决策权，并且扩展依赖该变化前必须更新协议文档。

如果改动需要远程服务、账号系统或分析管线，默认视为超出范围，除非 Patina 的产品方向先被明确改变。
