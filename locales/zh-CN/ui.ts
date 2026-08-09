import type { UiMessages } from "../schema.ts";

export const ui = {
  "options.headerDescription": "把当前活动网页同步到本机 Patina，用于补全桌面时间记录。",
  "options.serviceTitle": "网页同步", "options.portLabel": "端口", "options.tokenLabel": "Token",
  "options.syncButton": "同步当前页", "options.saveButton": "保存", "options.syncContentTitle": "同步内容",
  "options.syncContentText": "同步当前活动网页的网址、标题和网站图标。", "options.languageMenuLabel": "语言",
  "options.showToken": "显示 Token", "options.hideToken": "隐藏 Token", "popup.currentPageLabel": "当前网页",
  "popup.loading": "读取中", "popup.loadingTitle": "读取中…", "popup.noActivePage": "当前没有活动网页",
  "popup.httpOnly": "仅支持普通网站页面（http/https）", "popup.settings": "设置",
  "popup.completeSetup": "完成配置", "popup.syncCurrentPage": "同步当前页", "popup.privateBadge": "私密窗口",
  "popup.privateHelp": "私密窗口不会同步", "status.disabled": "未开启", "status.disconnected": "无网页",
  "status.connected": "已同步", "status.connecting": "同步中", "status.needsConfig": "待配置",
  "status.configured": "待同步", "status.private": "私密窗口不会同步", "status.saving": "保存中",
  "status.error": "未同步",
  "error.invalidToken": "Token 无效，请从 Patina 设置中重新复制。", "error.missingToken": "请填写 Token。",
  "error.webRecordingDisabled": "Patina 网页同步未开启。",
  "error.httpError": "Patina 暂时无法完成同步（HTTP {httpStatus}）。",
  "error.invalidResponse": "Patina 返回了无法识别的响应。", "error.serviceRejected": "Patina 拒绝了本次同步。",
  "error.requestFailed": "无法连接本机 Patina，请检查应用和端口。",
  "error.unknownService": "暂时无法同步，请稍后重试。",
} satisfies UiMessages;
