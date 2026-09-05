import type { UiMessages } from "../schema.ts";

export const ui = {
  "options.headerDescription": "Sincroniza la página web activa con Patina local para completar el registro de tiempo del escritorio.",
  "options.serviceTitle": "Sincronización web", "options.portLabel": "Puerto", "options.tokenLabel": "Token",
  "options.syncButton": "Sincronizar página actual", "options.saveButton": "Guardar",
  "options.syncContentTitle": "Datos sincronizados",
  "options.syncContentText": "Sincroniza la dirección, el título y el icono del sitio web activo.",
  "options.languageMenuLabel": "Idioma", "options.showToken": "Mostrar Token", "options.hideToken": "Ocultar Token",
  "popup.currentPageLabel": "Página actual", "popup.loading": "Cargando", "popup.loadingTitle": "Cargando…",
  "popup.noActivePage": "No hay una página web activa", "popup.httpOnly": "Solo se admiten páginas web normales (http/https)",
  "popup.settings": "Configuración", "popup.completeSetup": "Completar configuración", "popup.syncCurrentPage": "Sincronizar página actual",
  "popup.privateBadge": "Privada", "popup.privateHelp": "Las ventanas privadas no se sincronizan", "status.disabled": "Desactivada",
  "status.disconnected": "Sin página", "status.connected": "Sincronizada", "status.connecting": "Sincronizando",
  "status.needsConfig": "Sin configurar", "status.configured": "Pendiente",
  "status.private": "Las ventanas privadas no se sincronizan", "status.saving": "Guardando", "status.error": "Sin sincronizar",
  "error.invalidToken": "El Token no es válido. Cópialo de nuevo desde la configuración de Patina.",
  "error.missingToken": "Introduce un Token.", "error.webRecordingDisabled": "La sincronización web de Patina está desactivada.",
  "error.httpError": "Patina no pudo completar la sincronización (HTTP {httpStatus}).",
  "error.invalidResponse": "Patina devolvió una respuesta no reconocida.",
  "error.serviceRejected": "Patina rechazó esta sincronización.",
  "error.requestFailed": "No se pudo conectar con Patina local. Comprueba la aplicación y el puerto.",
  "error.unknownService": "No se pudo sincronizar. Inténtalo de nuevo en unos instantes.",
} satisfies UiMessages;
