import { createHash } from "node:crypto";
import { mcpConfig, redactSecrets } from "../providers/config.server";
import { getHodgeformAccessToken } from "./oauth.server";
import {
  classifyMcpResponse,
  rpc,
  stableStringify,
  syntheticCasePayload,
  syntheticLoopPayload,
} from "./protocol";

export type McpTool = {
  name: string;
  description?: string;
};

export type McpProbe = {
  ok: boolean;
  urlHost: string;
  auth: "missing" | "present";
  authMode: "missing" | "static_token" | "client_credentials";
  status: "connected" | "auth_required" | "unreachable" | "error";
  protocol?: string;
  tools: McpTool[];
  capabilitiesHash?: string;
  error?: string;
  latencyMs: number;
};

export type McpCallResult =
  | { ok: true; result: unknown }
  | { ok: false; error: string; code: string };

async function token(): Promise<string> {
  const got = await getHodgeformAccessToken();
  return got.token;
}

function hashPayload(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

async function postRpc(
  url: string,
  body: unknown,
  sessionId?: string,
): Promise<{
  httpStatus: number;
  location: string | null;
  contentType: string | null;
  json: unknown;
  sessionId?: string;
  raw: string;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  const t = await token();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      redirect: "manual",
      signal: ctrl.signal,
    });
    const raw = await res.text();
    let json: unknown = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }
    return {
      httpStatus: res.status,
      location: res.headers.get("location"),
      contentType: res.headers.get("content-type"),
      json,
      sessionId: res.headers.get("mcp-session-id") ?? sessionId,
      raw: raw.slice(0, 400),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function probeMcp(): Promise<McpProbe> {
  const cfg = mcpConfig();
  const started = Date.now();
  const auth = cfg.tokenPresent ? "present" : "missing";
  try {
    const init = await postRpc(
      cfg.url,
      rpc(1, "initialize", {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        clientInfo: { name: "hodgeform-guided", version: "0.1.0" },
      }),
    );
    const kind = classifyMcpResponse(init.httpStatus, init.location, init.contentType, init.raw);
    if (kind === "auth_required") {
      return {
        ok: false,
        urlHost: cfg.host,
        auth,
        authMode: cfg.authMode,
        status: "auth_required",
        tools: [],
        error:
          "Hodgeform MCP requires a tenant-bound server credential (static access token or OAuth client credentials). Browser cookies and frontend keys are refused.",
        latencyMs: Date.now() - started,
      };
    }
    if (kind !== "ok" || init.json == null) {
      return {
        ok: false,
        urlHost: cfg.host,
        auth,
        authMode: cfg.authMode,
        status: init.httpStatus === 0 ? "unreachable" : "error",
        tools: [],
        error: redactSecrets(`MCP HTTP ${init.httpStatus}: ${init.raw}`),
        latencyMs: Date.now() - started,
      };
    }

    const initBody = init.json as { result?: { protocolVersion?: string; serverInfo?: unknown } } | null;
    const protocol = initBody?.result?.protocolVersion;

    await postRpc(cfg.url, rpc(2, "notifications/initialized"), init.sessionId).catch(() => null);

    const listed = await postRpc(cfg.url, rpc(3, "tools/list"), init.sessionId);
    const listKind = classifyMcpResponse(listed.httpStatus, listed.location, listed.contentType, listed.raw);
    if (listKind !== "ok") {
      return {
        ok: false,
        urlHost: cfg.host,
        auth,
        authMode: cfg.authMode,
        status: listKind === "auth_required" ? "auth_required" : "error",
        protocol,
        tools: [],
        error: redactSecrets(`tools/list HTTP ${listed.httpStatus}`),
        latencyMs: Date.now() - started,
      };
    }
    const toolsRaw = (listed.json as { result?: { tools?: McpTool[] } } | null)?.result?.tools ?? [];
    const tools = toolsRaw.map((t) => ({
      name: String(t.name),
      description: t.description ? String(t.description) : undefined,
    }));
    return {
      ok: true,
      urlHost: cfg.host,
      auth,
      authMode: cfg.authMode,
      status: "connected",
      protocol,
      tools,
      capabilitiesHash: hashPayload(tools.map((t) => t.name)),
      latencyMs: Date.now() - started,
    };
  } catch (e) {
    return {
      ok: false,
      urlHost: cfg.host,
      auth,
      authMode: cfg.authMode,
      status: "unreachable",
      tools: [],
      error: redactSecrets(e instanceof Error ? e.message : "MCP probe failed"),
      latencyMs: Date.now() - started,
    };
  }
}

export async function callMcpTool(name: string, args: Record<string, unknown>): Promise<McpCallResult> {
  const probe = await probeMcp();
  if (!probe.ok) {
    return { ok: false, error: probe.error ?? "MCP unavailable", code: probe.status };
  }
  const found = probe.tools.find((t) => t.name === name);
  if (!found) {
    return {
      ok: false,
      error: `Tool ${name} is not in the discovered MCP catalog. Scientific behavior is not invented locally.`,
      code: "unknown_tool",
    };
  }
  const cfg = mcpConfig();
  try {
    const init = await postRpc(
      cfg.url,
      rpc(1, "initialize", {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        clientInfo: { name: "hodgeform-guided", version: "0.1.0" },
      }),
    );
    if (classifyMcpResponse(init.httpStatus, init.location, init.contentType, init.raw) !== "ok") {
      return { ok: false, error: "MCP session failed", code: "error" };
    }
    const called = await postRpc(
      cfg.url,
      rpc(4, "tools/call", { name, arguments: args }),
      init.sessionId,
    );
    if (classifyMcpResponse(called.httpStatus, called.location, called.contentType, called.raw) !== "ok") {
      return {
        ok: false,
        error: redactSecrets(`tools/call HTTP ${called.httpStatus}`),
        code: "error",
      };
    }
    const body = called.json as { result?: unknown; error?: { message?: string } } | null;
    if (body?.error) {
      return { ok: false, error: redactSecrets(body.error.message ?? "RPC error"), code: "rpc" };
    }
    return { ok: true, result: body?.result ?? body };
  } catch (e) {
    return {
      ok: false,
      error: redactSecrets(e instanceof Error ? e.message : "call failed"),
      code: "error",
    };
  }
}

export function guidedPlanPayload(input: {
  caseId: string;
  candidates: unknown[];
  summary: string;
  coverageNotes: string;
}) {
  return {
    case_id: input.caseId,
    summary: input.summary,
    candidates: input.candidates,
    coverage_notes: input.coverageNotes,
  };
}

export function payloadHash(value: unknown): string {
  return hashPayload(value);
}

function pickTool(names: Set<string>, pattern: RegExp): string | undefined {
  return [...names].find((n) => pattern.test(n));
}

function idFrom(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const row = result as Record<string, unknown>;
  if (typeof row.id === "string") return row.id;
  const nested = row.case ?? row.result ?? row.loop;
  if (nested && typeof nested === "object" && typeof (nested as { id?: string }).id === "string") {
    return (nested as { id: string }).id;
  }
  return undefined;
}

export async function runSyntheticCase(): Promise<{
  ok: boolean;
  error?: string;
  steps: { tool: string; ok: boolean; detail: string }[];
  hashes: Record<string, string>;
  ids: Record<string, string>;
}> {
  const probe = await probeMcp();
  if (!probe.ok) {
    return {
      ok: false,
      error: probe.error ?? "MCP not connected",
      steps: [{ tool: "tools/list", ok: false, detail: probe.status }],
      hashes: {},
      ids: {},
    };
  }
  const names = new Set(probe.tools.map((t) => t.name));
  const steps: { tool: string; ok: boolean; detail: string }[] = [
    { tool: "tools/list", ok: true, detail: `${probe.tools.length} tools from ${probe.urlHost}` },
  ];
  const hashes: Record<string, string> = {
    catalog: probe.capabilitiesHash ?? "",
  };
  const ids: Record<string, string> = {};

  const createName = pickTool(names, /case_create|create_case/i);
  if (!createName) {
    return {
      ok: false,
      error: "Discovered catalog has no case-create tool. Refusing to invent Core behavior.",
      steps,
      hashes,
      ids,
    };
  }

  const casePayload = syntheticCasePayload();
  hashes.case_create = payloadHash(casePayload);
  const created = await callMcpTool(createName, casePayload);
  const caseId = created.ok ? idFrom(created.result) : undefined;
  if (caseId) ids.case_id = caseId;
  steps.push({
    tool: createName,
    ok: created.ok,
    detail: created.ok ? `created ${caseId ?? "case"}` : created.error,
  });
  if (!created.ok) {
    return { ok: false, error: created.error, steps, hashes, ids };
  }

  const loopName = pickTool(names, /create_general_problem_loop|problem_loop_create/i);
  if (!loopName) {
    return {
      ok: true,
      steps: [
        ...steps,
        {
          tool: "loop_create",
          ok: false,
          detail: "No loop-create tool in catalog; case exists. Refusing to invent freeze.",
        },
      ],
      hashes,
      ids,
    };
  }

  const loopPayload = syntheticLoopPayload();
  hashes.loop_create = payloadHash(loopPayload);
  const looped = await callMcpTool(loopName, loopPayload);
  const loopId = looped.ok ? idFrom(looped.result) : undefined;
  if (loopId) ids.loop_id = loopId;
  steps.push({
    tool: loopName,
    ok: looped.ok,
    detail: looped.ok ? `loop ${loopId ?? "created"}` : looped.error,
  });
  if (!looped.ok) {
    return { ok: false, error: looped.error, steps, hashes, ids };
  }

  const verifyName = pickTool(names, /verify_general_problem_loop/i);
  if (verifyName && loopId) {
    const verified = await callMcpTool(verifyName, { loop_id: loopId });
    const valid = Boolean(
      verified.ok &&
        verified.result &&
        typeof verified.result === "object" &&
        (verified.result as { valid?: boolean }).valid,
    );
    hashes.loop_verify = payloadHash({ loop_id: loopId });
    const verifyError = verified.ok
      ? valid
        ? undefined
        : "Loop verify failed"
      : verified.error;
    steps.push({
      tool: verifyName,
      ok: verified.ok && valid,
      detail: verified.ok ? (valid ? "Core hashes verified" : "Core returned invalid") : verified.error,
    });
    return {
      ok: verified.ok && valid,
      error: verifyError,
      steps,
      hashes,
      ids,
    };
  }

  return { ok: created.ok && looped.ok, steps, hashes, ids };
}
