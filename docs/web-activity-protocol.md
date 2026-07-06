# Patina Web Activity 协议

## 目的

本文定义 Patina 与 Patina Web Sync 之间的本机协议。

Patina 拥有接收端和本地数据行为。Patina Web Sync 拥有浏览器扩展客户端，负责把活动标签页元数据发送给本机 Patina 应用。

## 边界

- 该协议仅用于本机通信。
- 客户端连接到 `http://127.0.0.1:<port>` 或 `http://localhost:<port>`。
- 鉴权使用 Patina Settings 显示的 bearer token。
- 该协议不是云同步、账号、分析或远程采集 API。

## 接口

```http
POST /web-activity
Authorization: Bearer <token>
Content-Type: application/json
```

## Request Body

浏览器扩展发送 camelCase 字段的 JSON object 作为 request body：

```json
{
  "protocolVersion": 1,
  "browserClientId": "uuid-or-client-id",
  "browserKind": "chrome",
  "extensionVersion": "0.2.0",
  "tabId": 1,
  "windowId": 1,
  "url": "https://example.com/page",
  "title": "Example Page",
  "favIconUrl": "https://example.com/favicon.ico",
  "incognito": false,
  "capturedAtMs": 1710000000000,
  "eventReason": "tab-activated"
}
```

Patina 当前默认保存域名级网页活动。完整页面 URL 默认不会被 sanitizer 持久化。

当前扩展客户端在发送前会跳过 incognito/private 标签页。普通 `http` / `https` 标签页仍使用协议 v1 payload，并可继续携带 `incognito: false` 字段以保持 shape 兼容。

## 忽略或拒绝的输入

以下情况中，Patina 会忽略或拒绝记录：

- token 缺失或无效
- Patina 中 Web Sync 已关闭
- URL 缺失或无效
- URL scheme 不是 `http` 或 `https`
- 浏览器标签页处于 incognito/private 状态

Patina 接收端仍必须保留 incognito/private 忽略逻辑。这是旧扩展、异常客户端或恶意本机客户端的第二道防线；它不能替代新扩展客户端的发送前过滤。

## Response Body

Success response body：

```json
{
  "ok": true,
  "enabled": true,
  "changed": true,
  "serverTimeMs": 1710000000000
}
```

Web Sync disabled response body：

```json
{
  "ok": false,
  "enabled": false,
  "code": "web-recording-disabled",
  "message": "Patina web recording is off.",
  "serverTimeMs": 1710000000000
}
```

Error response body 使用 `ok: false`、稳定的 `code` 和人类可读的 `message`。

扩展客户端只有在 HTTP status 成功且 JSON response body 显式包含 `ok: true` 时，才应把本次同步视为成功。任意非 JSON `2xx` 响应、缺少 `ok: true` 的响应或 `ok: false` 响应都不得显示为已同步。

## 变更策略

协议变更应优先保证接收端兼容：

1. Patina 同时接收旧客户端和新客户端 shape。
2. Patina Web Sync 开始发送新的 shape。
3. 只有经过单独兼容性决策后，才移除旧兼容。

Firefox AMO 签名和浏览器商店审核可能让扩展发布慢于 Patina release，因此 Patina 不应要求普通桌面更新必须同日升级扩展。
