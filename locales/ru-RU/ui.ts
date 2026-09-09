import type { UiMessages } from "../schema.ts";

export const ui = {
  "options.headerDescription": "Передавайте сведения об активной веб-странице в локальное приложение Patina для учёта времени.",
  "options.serviceTitle": "Синхронизация сайтов", "options.portLabel": "Порт", "options.tokenLabel": "Token",
  "options.syncButton": "Синхронизировать страницу", "options.saveButton": "Сохранить",
  "options.syncContentTitle": "Передаваемые данные",
  "options.syncContentText": "Передаются адрес, заголовок и значок активного сайта.",
  "options.languageMenuLabel": "Язык", "options.showToken": "Показать Token", "options.hideToken": "Скрыть Token",
  "popup.currentPageLabel": "Текущая страница", "popup.loading": "Загрузка", "popup.loadingTitle": "Загрузка…",
  "popup.noActivePage": "Нет активной веб-страницы", "popup.httpOnly": "Поддерживаются только обычные веб-страницы (http/https)",
  "popup.settings": "Настройки", "popup.completeSetup": "Завершить настройку", "popup.syncCurrentPage": "Синхронизировать страницу",
  "popup.privateBadge": "Приватно", "popup.privateHelp": "Приватные окна не синхронизируются", "status.disabled": "Отключено",
  "status.disconnected": "Нет сайта", "status.connected": "Передано", "status.connecting": "Отправка",
  "status.needsConfig": "Не настроен", "status.configured": "Ожидание",
  "status.private": "Приватные окна не синхронизируются", "status.saving": "Сохранение", "status.error": "Не передано",
  "error.invalidToken": "Неверный Token. Скопируйте его снова из настроек Patina.",
  "error.missingToken": "Введите Token.", "error.webRecordingDisabled": "Синхронизация сайтов в Patina отключена.",
  "error.httpError": "Patina не удалось завершить синхронизацию (HTTP {httpStatus}).",
  "error.invalidResponse": "Patina вернула ответ неизвестного формата.",
  "error.serviceRejected": "Patina отклонила синхронизацию.",
  "error.requestFailed": "Не удалось связаться с локальным приложением Patina. Проверьте приложение и порт.",
  "error.unknownService": "Сейчас синхронизация недоступна. Повторите чуть позже.",
} satisfies UiMessages;
