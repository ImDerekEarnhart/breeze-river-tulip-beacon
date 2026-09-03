/** Canonical JSON for client-side request parity. Core hashes remain authoritative. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export function classifyMcpHttp(status: number, location: string | null): "ok" | "auth_required" | "not_found" | "error" {
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
export function classifyMcpResponse(
  status: number,
  location: string | null,
  contentType: string | null,
  raw: string,
): "ok" | "auth_required" | "not_found" | "error" {
  const ct = (contentType ?? "").toLowerCase();
  const body = raw.slice(0, 1200);
  if (
    ct.includes("text/html") ||
    /<!doctype html/i.test(body) ||
    /<title>[^<]*(sign in|log in|login)/i.test(body)
  ) {
    return "auth_required";
  }
  return classifyMcpHttp(status, location);
}

export function deriveHealthUrl(baseUrl: string, explicitHealth = ""): string {
  const explicit = explicitHealth.trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const base = baseUrl.trim().replace(/\/+$/, "");
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

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: unknown;
};

export function rpc(id: number, method: string, params?: unknown): JsonRpcRequest {
  return params === undefined
    ? { jsonrpc: "2.0", id, method }
    : { jsonrpc: "2.0", id, method, params };
}

export const EQUAL_BUDGET = {
  maxOutputTokens: 500,
  timeoutSeconds: 45,
  nTasks: 3,
} as const;

export function syntheticCasePayload() {
  return {
    name: "SYNTHETIC Guided integration proof",
    goal: "Non-production proof that Guided can open a tenant case. Not a scientific claim. Do not approve or execute research plans.",
    domain_hint: "integration proof / guided-mcp parity / synthetic",
  };
}

export function syntheticLoopPayload() {
  return {
    goal: "SYNTHETIC: freeze a harmless objective in Hodgeform Core without claiming a scientific result.",
    success_criteria: [
      "Loop exists in Core with a server hash",
      "Verify tool recomputes hashes without inventing evidence",
      "No plan auto-approval",
    ],
    allowed_capabilities: [
      "orbita_create_general_problem_loop",
      "orbita_verify_general_problem_loop",
      "orbita_list_cases",
    ],
    max_cycles: 1,
    created_by: "hodgeform-guided-orchestrator",
  };
}
