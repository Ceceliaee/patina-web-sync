// Target copies are generated from this shared source.
(() => {
  const STATUS_SCHEMA_VERSION = 1;
  const ERROR_CODES = new Set([
    "none", "missing-token", "invalid-token", "web-recording-disabled", "http-error",
    "invalid-response", "service-rejected", "request-failed", "unknown-service-error",
  ]);
  const STATUS_CODES = new Set([
    "disabled", "configured", "connecting", "connected", "disconnected", "private",
    "needs-config", "error",
  ]);
  const DEFAULT_STATUS_STATE = Object.freeze({
    lastStatus: "disabled",
    lastErrorCode: "none",
    lastErrorParams: Object.freeze({}),
    lastSeenAt: 0,
    statusSchemaVersion: STATUS_SCHEMA_VERSION,
  });

  function safeParams(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const httpStatus = Number(value.httpStatus);
    return Number.isInteger(httpStatus) && httpStatus >= 100 && httpStatus <= 599
      ? { httpStatus }
      : {};
  }

  function legacyErrorCode(status, message) {
    const value = String(message || "").trim().toLowerCase();
    if (!value) return status === "error" ? "unknown-service-error" : "none";
    if (
      value.includes("invalid web activity token") || value.includes("invalid token")
      || value.includes("unauthorized") || (value.includes("token") && value.includes("无效"))
    ) return "invalid-token";
    if ((value.includes("missing") && value.includes("token")) || value.includes("请填写 token")) {
      return "missing-token";
    }
    if (value.includes("web recording is off") || value.includes("网页同步未开启")) {
      return "web-recording-disabled";
    }
    return "unknown-service-error";
  }

  function normalizeStoredState(raw) {
    const status = STATUS_CODES.has(raw?.lastStatus) ? raw.lastStatus : "disabled";
    const legacyMessage = String(raw?.lastMessage || "").trim();
    const requestedErrorCode = String(raw?.lastErrorCode || "");
    const errorCode = ERROR_CODES.has(requestedErrorCode)
      ? requestedErrorCode
      : legacyErrorCode(status, legacyMessage);
    const state = {
      ...raw,
      lastStatus: status,
      lastErrorCode: errorCode,
      lastErrorParams: safeParams(raw?.lastErrorParams),
      lastSeenAt: Number.isFinite(raw?.lastSeenAt) ? raw.lastSeenAt : 0,
      statusSchemaVersion: STATUS_SCHEMA_VERSION,
    };
    delete state.lastMessage;
    const patch = {};
    for (const key of ["lastStatus", "lastErrorCode", "lastErrorParams", "lastSeenAt", "statusSchemaVersion"]) {
      if (JSON.stringify(raw?.[key]) !== JSON.stringify(state[key])) patch[key] = state[key];
    }
    return { state, patch, removeKeys: Object.hasOwn(raw || {}, "lastMessage") ? ["lastMessage"] : [] };
  }

  function statusPatch(lastStatus, lastErrorCode = "none", lastErrorParams = {}) {
    if (!STATUS_CODES.has(lastStatus)) throw new Error(`Unknown Patina status: ${lastStatus}`);
    if (!ERROR_CODES.has(lastErrorCode)) throw new Error(`Unknown Patina error code: ${lastErrorCode}`);
    return {
      lastStatus,
      lastErrorCode,
      lastErrorParams: safeParams(lastErrorParams),
      lastSeenAt: Date.now(),
      statusSchemaVersion: STATUS_SCHEMA_VERSION,
    };
  }

  function mapServiceErrorCode(code) {
    const value = String(code || "").trim().toLowerCase();
    if (["invalid-token", "invalid-web-activity-token", "unauthorized"].includes(value)) return "invalid-token";
    if (["missing-token", "web-activity-token-required"].includes(value)) return "missing-token";
    if (value === "web-recording-disabled") return "web-recording-disabled";
    return value ? "service-rejected" : "unknown-service-error";
  }

  function classifyBridgeResponse(response, data, jsonParsed) {
    const status = Number(response?.status) || 0;
    if (
      jsonParsed && data && typeof data === "object" && !Array.isArray(data)
      && data.enabled === false && data.code === "web-recording-disabled"
    ) {
      return { lastStatus: "disabled", lastErrorCode: "web-recording-disabled", lastErrorParams: {} };
    }
    if (!response?.ok) {
      return status === 401 || status === 403
        ? { lastStatus: "error", lastErrorCode: "invalid-token", lastErrorParams: {} }
        : { lastStatus: "error", lastErrorCode: "http-error", lastErrorParams: { httpStatus: status } };
    }
    if (!jsonParsed || !data || typeof data !== "object" || Array.isArray(data)) {
      return { lastStatus: "error", lastErrorCode: "invalid-response", lastErrorParams: {} };
    }
    if (data.enabled === false) {
      return { lastStatus: "disabled", lastErrorCode: "web-recording-disabled", lastErrorParams: {} };
    }
    if (typeof data.ok !== "boolean") {
      return { lastStatus: "error", lastErrorCode: "invalid-response", lastErrorParams: {} };
    }
    if (data.ok !== true) {
      return { lastStatus: "error", lastErrorCode: mapServiceErrorCode(data.code), lastErrorParams: {} };
    }
    return { lastStatus: "connected", lastErrorCode: "none", lastErrorParams: {} };
  }

  globalThis.PatinaStatus = Object.freeze({
    DEFAULT_STATUS_STATE, STATUS_SCHEMA_VERSION, classifyBridgeResponse, normalizeStoredState, statusPatch,
  });
})();
