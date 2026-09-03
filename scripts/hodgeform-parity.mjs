export function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

export function classifyMcpHttp(status, location) {
  if (status >= 200 && status < 300) return "ok";
  if (status === 401 || status === 403) return "auth_required";
  if (status === 302 || status === 301 || status === 307 || status === 308) {
    if (location && /login|oauth|authorize/i.test(location)) return "auth_required";
    return "auth_required";
  }
  if (status === 404) return "not_found";
  return "error";
}

/** Login HTML on HTTP 200 is not a connected MCP session. */
export function classifyMcpResponse(status, location, contentType, raw) {
  const ct = (contentType ?? "").toLowerCase();
  const body = String(raw ?? "").slice(0, 1200);
  if (
    ct.includes("text/html") ||
    /<!doctype html/i.test(body) ||
    /<title>[^<]*(sign in|log in|login)/i.test(body)
  ) {
    return "auth_required";
  }
  return classifyMcpHttp(status, location);
}

export function deriveHealthUrl(baseUrl, explicitHealth = "") {
  const explicit = String(explicitHealth ?? "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const base = String(baseUrl ?? "").trim().replace(/\/+$/, "");
  if (!base) return "";
  try {
    const u = new URL(base);
    const path = u.pathname.replace(/\/+$/, "") || "";
    if (path === "/v1") return `${u.origin}/health`;
    return `${base}/models`;
  } catch {
    return "";
  }
}

/** Channel is metadata only and must not enter the hashed Core payload. */
export function guidedPlanPayload({ caseId, candidates, summary, coverageNotes }) {
  return {
    case_id: caseId,
    summary,
    candidates,
    coverage_notes: coverageNotes,
  };
}

export function syntheticCasePayload() {
  return {
    name: "SYNTHETIC Guided integration proof",
    goal: "Non-production proof that Guided can open a tenant case. Not a scientific claim. Do not approve or execute research plans.",
    domain_hint: "integration proof / guided-mcp parity / synthetic",
  };
}

export const EQUAL_BUDGET = {
  maxOutputTokens: 500,
  timeoutSeconds: 45,
  nTasks: 3,
};
