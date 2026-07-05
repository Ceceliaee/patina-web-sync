# Quiet Pro 组件指南

## 目的

这是 Patina Web Sync 浏览器扩展 UI 的轻量版 Quiet Pro 指南。

它把 Patina 冷静、专业的桌面产品基线适配到小型扩展界面：popup、options 页面、设置说明、连接状态和简单控件。它刻意比 Patina 桌面 UI 系统更小。

## 设计基线

Patina Web Sync UI 应该给人的感觉是：

- 安静
- 可信
- 紧凑
- 可读
- 实用
- 本地优先

UI 应帮助用户配置本机 Patina 连接，并理解同步状态。它不应该像 landing page、dashboard、营销页面或独立生产力应用。

## 界面规则

popup 用于快速状态和即时动作。

options 页面用于设置字段、已保存连接信息和测试/发送动作。

除非用户流程真的需要，否则不要新增更多页面。浏览器扩展 UI 的注意力预算很小；每个界面优先承载一个清楚任务。

## 视觉规则

- 优先使用系统字体和浏览器原生可读性。
- 对重复出现的颜色、间距、边框和圆角使用 CSS variables。
- 圆角、边框和阴影保持克制。
- 字号保持适中且稳定。
- 避免大面积渐变、发光、glassmorphism、重 blur 面板、装饰背景和动画化视觉效果。
- 不加载远程字体、图标包、图片、脚本、分析或样式。

可以有一点温度，但外围 chrome 应保持中性和耐看。

## 布局规则

- 表单保持纵向易扫读。
- label 靠近对应 input。
- 按钮保持可预期：primary 用于保存/测试，secondary 用于导航或重置。
- 状态消息放在稳定槽位，避免 popup/options 布局跳动。
- popup 保持足够紧凑，适合反复从浏览器打开。
- 不要在 card 里再放 card。优先使用简单 section 和 separator。

## 交互状态

控件在相关场景下应有清楚状态：

- default
- hover
- active
- focus
- disabled
- loading 或 pending
- success
- warning
- error

状态不能只依赖颜色。颜色要配合可读文字。

## 文案规则

使用朴素、本地优先的语言。

推荐：

- "Connected to Patina"
- "Patina Web Sync is waiting for a port and token"
- "Open Patina Settings to copy the local port and token"

避免暗示云同步、账号同步、远程上传、分析或团队追踪的语言。

## 可访问性规则

- 每个 input 都需要可见 label。
- Keyboard focus 应可见。
- 按钮应能通过键盘访问，并且含义清楚。
- 错误文案应说明下一步有用动作。
- 文字在浏览器扩展 popup 尺寸下仍应可读。

## 浏览器目标规则

Chromium 和 Firefox UI 应保持视觉和行为一致，除非浏览器平台差异强制分化。

修改共享 UI 文案或交互行为时，默认同时更新两个目标，除非有已记录的目标专属原因。

## 验证

UI 改动后运行：

```bash
npm run check
```

如果改动影响打包、manifest、脚本或 release asset，还要运行：

```bash
npm run release:check
```
