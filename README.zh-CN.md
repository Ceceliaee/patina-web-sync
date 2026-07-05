# Patina Web Sync

Patina Web Sync 是 [Patina](https://github.com/Ceceliaee/patina) 的浏览器扩展伴生项目。Patina 是一个本地优先的 Windows 桌面时间追踪应用。

扩展会把当前活动网页发送给同一台电脑上运行的 Patina。Patina 使用这个本机信号为桌面时间记录补充网页上下文。

## 范围

- 这是 Patina 的公开伴生扩展项目。
- 支持 Chromium 系和 Firefox 系浏览器扩展目标。
- 只通过 `127.0.0.1` 或 `localhost` 与本机 Patina 通信。
- 不提供账号系统、云同步、团队空间、分析服务或远程数据收集。

## 隐私边界

配置完成后，扩展只发送 Patina 所需的活动标签页元数据：

- 网页 URL 和标题
- 网站图标引用，或在支持时发送本地图标数据
- 浏览器类型、标签页/窗口 id、扩展版本、采集时间和无痕状态

它不读取网页正文、表单内容、密码、截图、剪贴板、cookie、下载历史或浏览器历史数据库。

## 仓库结构

- `src/chromium/`：Chromium MV3 扩展目标。
- `src/firefox/`：Firefox WebExtension 目标。
- `scripts/`：检查、构建、打包和签名辅助脚本。
- `store-assets/`：商店素材。
- `docs/product-principles-and-scope.md`：长期产品边界和范围规则。
- `docs/architecture.md`：长期浏览器扩展架构和所有权边界。
- `docs/engineering-quality.md`：验证、隐私、发布和跨浏览器质量规则。
- `docs/quiet-pro-component-guidelines.md`：popup/options UI 的轻量 Quiet Pro 规则。
- `docs/versioning-and-release-policy.md`：版本、打包、AMO 签名和发布规则。
- `docs/web-activity-protocol.md`：Patina 与本扩展之间的本机协议。

## 开发

安装依赖：

```bash
npm install
```

检查两个扩展目标：

```bash
npm run check
```

构建 Chromium 未打包目录：

```bash
npm run extension:chromium:build
```

构建 Firefox 未打包目录：

```bash
npm run extension:firefox:build
```

打包 Chromium release asset：

```bash
npm run extension:chromium:package
```

打包 Firefox 未签名开发 zip：

```bash
npm run extension:firefox:package
```

Firefox AMO 签名是发布动作，不是普通本地验证步骤。只有准备真实 Firefox 发布，并确认 Firefox manifest version 已向前提升后，才运行 `npm run extension:firefox:sign`。

## 用户配置

先安装 Patina，然后在 Patina 设置页开启网页同步。把 Patina 显示的本机端口和 token 填入扩展选项页。

面向用户的配置步骤由 Patina README 和 Patina 设置页维护，这样桌面应用始终是本机配置说明的来源。
