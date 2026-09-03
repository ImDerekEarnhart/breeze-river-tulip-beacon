import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/mcp.server-DDOhHMm3.js
/** Canonical JSON for client-side request parity. Core hashes remain authoritative. */
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
	const obj = value;
	return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
function classifyMcpHttp(status, location) {
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
function classifyMcpResponse(status, location, contentType, raw) {
	const ct = (contentType ?? "").toLowerCase();
	const body = raw.slice(0, 1200);
	if (ct.includes("text/html") || /<!doctype html/i.test(body) || /<title>[^<]*(sign in|log in|login)/i.test(body)) return "auth_required";
	return classifyMcpHttp(status, location);
}
function deriveHealthUrl(baseUrl, explicitHealth = "") {
	const explicit = explicitHealth.trim().replace(/\/+$/, "");
	if (explicit) return explicit;
	const base = baseUrl.trim().replace(/\/+$/, "");
	if (!base) return "";
	try {
		const u = new URL(base);
		if ((u.pathname.replace(/\/+$/, "") || "") === "/v1") return `${u.origin}/health`;
		return `${base}/models`;
	} catch {
		return "";
	}
}
function rpc(id, method, params) {
	return params === void 0 ? {
		jsonrpc: "2.0",
		id,
		method
	} : {
		jsonrpc: "2.0",
		id,
		method,
		params
	};
}
var EQUAL_BUDGET = {
	maxOutputTokens: 500,
	timeoutSeconds: 45,
	nTasks: 3
};
function syntheticCasePayload() {
	return {
		name: "SYNTHETIC Guided integration proof",
		goal: "Non-production proof that Guided can open a tenant case. Not a scientific claim. Do not approve or execute research plans.",
		domain_hint: "integration proof / guided-mcp parity / synthetic"
	};
}
function syntheticLoopPayload() {
	return {
		goal: "SYNTHETIC: freeze a harmless objective in Hodgeform Core without claiming a scientific result.",
		success_criteria: [
			"Loop exists in Core with a server hash",
			"Verify tool recomputes hashes without inventing evidence",
			"No plan auto-approval"
		],
		allowed_capabilities: [
			"orbita_create_general_problem_loop",
			"orbita_verify_general_problem_loop",
			"orbita_list_cases"
		],
		max_cycles: 1,
		created_by: "hodgeform-guided-orchestrator"
	};
}
var cache = null;
function env$1(name) {
	return (process.env[name] ?? "").trim();
}
function redact(text) {
	let out = text;
	const secret = env$1("HODGEFORM_CLIENT_SECRET");
	if (secret && secret.length >= 8) out = out.split(secret).join("[redacted]");
	return out.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
}
function hodgeformAuthMode() {
	if (env$1("HODGEFORM_MCP_ACCESS_TOKEN")) return "static_token";
	if (env$1("HODGEFORM_CLIENT_ID") && env$1("HODGEFORM_CLIENT_SECRET") && env$1("HODGEFORM_TOKEN_URL")) return "client_credentials";
	return "missing";
}
async function getHodgeformAccessToken() {
	const mode = hodgeformAuthMode();
	if (mode === "static_token") return {
		token: env$1("HODGEFORM_MCP_ACCESS_TOKEN"),
		mode
	};
	if (mode !== "client_credentials") return {
		token: "",
		mode: "missing",
		error: "No tenant-bound server credential. Set HODGEFORM_MCP_ACCESS_TOKEN or HODGEFORM_CLIENT_ID + HODGEFORM_CLIENT_SECRET + HODGEFORM_TOKEN_URL. Browser cookies and VITE_ keys are refused."
	};
	if (cache && cache.expiresAt > Date.now() + 5e3) return {
		token: cache.token,
		mode
	};
	const tokenUrl = env$1("HODGEFORM_TOKEN_URL");
	const body = new URLSearchParams({
		grant_type: "client_credentials",
		client_id: env$1("HODGEFORM_CLIENT_ID"),
		client_secret: env$1("HODGEFORM_CLIENT_SECRET")
	});
	const scope = env$1("HODGEFORM_OAUTH_SCOPE");
	if (scope) body.set("scope", scope);
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 6e3);
	try {
		const res = await fetch(tokenUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json"
			},
			body,
			redirect: "manual",
			signal: ctrl.signal
		});
		const raw = await res.text();
		const ct = res.headers.get("content-type") ?? "";
		if (/text\/html/i.test(ct) || /<!doctype html/i.test(raw) || res.status === 301 || res.status === 302) return {
			token: "",
			mode,
			error: "Token URL returned a login page. Use a machine client-credentials endpoint, not browser OAuth."
		};
		if (!res.ok) return {
			token: "",
			mode,
			error: redact(`token HTTP ${res.status}: ${raw.slice(0, 180)}`)
		};
		let json;
		try {
			json = JSON.parse(raw);
		} catch {
			return {
				token: "",
				mode,
				error: "Token response was not JSON"
			};
		}
		if (!json.access_token) return {
			token: "",
			mode,
			error: "Token response had no access_token"
		};
		const ttl = typeof json.expires_in === "number" && json.expires_in > 60 ? json.expires_in : 300;
		cache = {
			token: json.access_token,
			expiresAt: Date.now() + ttl * 1e3
		};
		return {
			token: json.access_token,
			mode
		};
	} catch (e) {
		return {
			token: "",
			mode,
			error: redact(e instanceof Error ? e.message : "token fetch failed")
		};
	} finally {
		clearTimeout(timer);
	}
}
function env(name, fallback = "") {
	return (process.env[name] ?? fallback).trim();
}
function envInt(name, fallback) {
	const n = Number(env(name));
	return Number.isFinite(n) && n > 0 ? n : fallback;
}
function hostOf(url) {
	if (!url) return "";
	try {
		return new URL(url).host;
	} catch {
		return "";
	}
}
function isXai(url) {
	return /api\.x\.ai/i.test(url);
}
function roleConfig(role) {
	const prefix = role === "student" ? "STUDENT" : "TEACHER";
	const xaiKey = env("XAI_API_KEY");
	const explicitUrl = env(`${prefix}_BASE_URL`);
	const baseUrl = role === "student" ? explicitUrl : explicitUrl || (xaiKey ? "https://api.x.ai/v1" : "");
	const provider = env(`${prefix}_PROVIDER`) || (baseUrl ? isXai(baseUrl) ? "xai" : "openai-compatible" : "none");
	const modelId = env(`${prefix}_MODEL_ID`) || (isXai(baseUrl) ? "grok-4.5" : "");
	const modelRevision = env(`${prefix}_MODEL_REVISION`);
	const healthUrl = deriveHealthUrl(baseUrl, env(`${prefix}_HEALTH_URL`));
	const failClosed = env(`${prefix}_FAIL_CLOSED`, role === "student" || explicitUrl && !isXai(explicitUrl) ? "true" : "false") === "true";
	return {
		role,
		provider,
		baseUrl: baseUrl.replace(/\/+$/, ""),
		modelId,
		modelRevision,
		healthUrl,
		timeoutSeconds: envInt(`${prefix}_TIMEOUT_SECONDS`, role === "student" ? 45 : 90),
		maxOutputTokens: envInt(`${prefix}_MAX_OUTPUT_TOKENS`, role === "student" ? 500 : 900),
		temperature: Number(env(`${prefix}_TEMPERATURE`, role === "student" ? "0.2" : "0.3")),
		maxConcurrency: envInt(`${prefix}_MAX_CONCURRENCY`, 2),
		contextWindow: envInt(`${prefix}_CONTEXT_WINDOW`, 8192),
		failClosed,
		configured: Boolean(baseUrl),
		baseHost: hostOf(baseUrl),
		healthHost: hostOf(healthUrl)
	};
}
function studentConfig() {
	return roleConfig("student");
}
function teacherConfig() {
	return roleConfig("teacher");
}
function apiKeyFor(cfg) {
	return env(`${cfg.role === "student" ? "STUDENT" : "TEACHER"}_API_KEY`) || (isXai(cfg.baseUrl) ? env("XAI_API_KEY") : "");
}
function mcpConfig() {
	const url = env("HODGEFORM_MCP_URL", "https://staging.hodgeform.com/mcp");
	const tokenUrl = env("HODGEFORM_TOKEN_URL");
	const uiHealthUrl = env("HODGEFORM_UI_HEALTH_URL", "https://staging.hodgeform.com/health");
	const mode = hodgeformAuthMode();
	return {
		url,
		host: hostOf(url),
		tokenUrl,
		tokenUrlHost: hostOf(tokenUrl),
		uiHealthUrl,
		uiHealthHost: hostOf(uiHealthUrl),
		authMode: mode,
		tokenPresent: mode !== "missing"
	};
}
function publicRoleStatus(cfg) {
	return {
		role: cfg.role,
		configured: cfg.configured,
		provider: cfg.provider,
		baseHost: cfg.baseHost,
		healthHost: cfg.healthHost,
		modelIdConfigured: cfg.modelId,
		modelRevision: cfg.modelRevision,
		failClosed: cfg.failClosed
	};
}
/** Strip secrets from strings that may be logged or returned to the UI. */
function redactSecrets(text) {
	let out = text;
	const secrets = [
		env("XAI_API_KEY"),
		env("STUDENT_API_KEY"),
		env("TEACHER_API_KEY"),
		env("HODGEFORM_MCP_ACCESS_TOKEN"),
		env("HODGEFORM_CLIENT_SECRET")
	];
	for (const s of secrets) if (s && s.length >= 8) out = out.split(s).join("[redacted]");
	out = out.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
	return out;
}
async function token() {
	return (await getHodgeformAccessToken()).token;
}
function hashPayload(value) {
	return createHash("sha256").update(stableStringify(value)).digest("hex");
}
async function postRpc(url, body, sessionId) {
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream"
	};
	const t = await token();
	if (t) headers.Authorization = `Bearer ${t}`;
	if (sessionId) headers["Mcp-Session-Id"] = sessionId;
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 6e3);
	try {
		const res = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			redirect: "manual",
			signal: ctrl.signal
		});
		const raw = await res.text();
		let json = null;
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
			raw: raw.slice(0, 400)
		};
	} finally {
		clearTimeout(timer);
	}
}
async function probeMcp() {
	const cfg = mcpConfig();
	const started = Date.now();
	const auth = cfg.tokenPresent ? "present" : "missing";
	try {
		const init = await postRpc(cfg.url, rpc(1, "initialize", {
			protocolVersion: "2025-03-26",
			capabilities: { tools: {} },
			clientInfo: {
				name: "hodgeform-guided",
				version: "0.1.0"
			}
		}));
		const kind = classifyMcpResponse(init.httpStatus, init.location, init.contentType, init.raw);
		if (kind === "auth_required") return {
			ok: false,
			urlHost: cfg.host,
			auth,
			authMode: cfg.authMode,
			status: "auth_required",
			tools: [],
			error: "Hodgeform MCP requires a tenant-bound server credential (static access token or OAuth client credentials). Browser cookies and frontend keys are refused.",
			latencyMs: Date.now() - started
		};
		if (kind !== "ok" || init.json == null) return {
			ok: false,
			urlHost: cfg.host,
			auth,
			authMode: cfg.authMode,
			status: init.httpStatus === 0 ? "unreachable" : "error",
			tools: [],
			error: redactSecrets(`MCP HTTP ${init.httpStatus}: ${init.raw}`),
			latencyMs: Date.now() - started
		};
		const protocol = init.json?.result?.protocolVersion;
		await postRpc(cfg.url, rpc(2, "notifications/initialized"), init.sessionId).catch(() => null);
		const listed = await postRpc(cfg.url, rpc(3, "tools/list"), init.sessionId);
		const listKind = classifyMcpResponse(listed.httpStatus, listed.location, listed.contentType, listed.raw);
		if (listKind !== "ok") return {
			ok: false,
			urlHost: cfg.host,
			auth,
			authMode: cfg.authMode,
			status: listKind === "auth_required" ? "auth_required" : "error",
			protocol,
			tools: [],
			error: redactSecrets(`tools/list HTTP ${listed.httpStatus}`),
			latencyMs: Date.now() - started
		};
		const tools = (listed.json?.result?.tools ?? []).map((t) => ({
			name: String(t.name),
			description: t.description ? String(t.description) : void 0
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
			latencyMs: Date.now() - started
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
			latencyMs: Date.now() - started
		};
	}
}
async function callMcpTool(name, args) {
	const probe = await probeMcp();
	if (!probe.ok) return {
		ok: false,
		error: probe.error ?? "MCP unavailable",
		code: probe.status
	};
	if (!probe.tools.find((t) => t.name === name)) return {
		ok: false,
		error: `Tool ${name} is not in the discovered MCP catalog. Scientific behavior is not invented locally.`,
		code: "unknown_tool"
	};
	const cfg = mcpConfig();
	try {
		const init = await postRpc(cfg.url, rpc(1, "initialize", {
			protocolVersion: "2025-03-26",
			capabilities: { tools: {} },
			clientInfo: {
				name: "hodgeform-guided",
				version: "0.1.0"
			}
		}));
		if (classifyMcpResponse(init.httpStatus, init.location, init.contentType, init.raw) !== "ok") return {
			ok: false,
			error: "MCP session failed",
			code: "error"
		};
		const called = await postRpc(cfg.url, rpc(4, "tools/call", {
			name,
			arguments: args
		}), init.sessionId);
		if (classifyMcpResponse(called.httpStatus, called.location, called.contentType, called.raw) !== "ok") return {
			ok: false,
			error: redactSecrets(`tools/call HTTP ${called.httpStatus}`),
			code: "error"
		};
		const body = called.json;
		if (body?.error) return {
			ok: false,
			error: redactSecrets(body.error.message ?? "RPC error"),
			code: "rpc"
		};
		return {
			ok: true,
			result: body?.result ?? body
		};
	} catch (e) {
		return {
			ok: false,
			error: redactSecrets(e instanceof Error ? e.message : "call failed"),
			code: "error"
		};
	}
}
function guidedPlanPayload(input) {
	return {
		case_id: input.caseId,
		summary: input.summary,
		candidates: input.candidates,
		coverage_notes: input.coverageNotes
	};
}
function payloadHash(value) {
	return hashPayload(value);
}
function pickTool(names, pattern) {
	return [...names].find((n) => pattern.test(n));
}
function idFrom(result) {
	if (!result || typeof result !== "object") return void 0;
	const row = result;
	if (typeof row.id === "string") return row.id;
	const nested = row.case ?? row.result ?? row.loop;
	if (nested && typeof nested === "object" && typeof nested.id === "string") return nested.id;
}
async function runSyntheticCase() {
	const probe = await probeMcp();
	if (!probe.ok) return {
		ok: false,
		error: probe.error ?? "MCP not connected",
		steps: [{
			tool: "tools/list",
			ok: false,
			detail: probe.status
		}],
		hashes: {},
		ids: {}
	};
	const names = new Set(probe.tools.map((t) => t.name));
	const steps = [{
		tool: "tools/list",
		ok: true,
		detail: `${probe.tools.length} tools from ${probe.urlHost}`
	}];
	const hashes = { catalog: probe.capabilitiesHash ?? "" };
	const ids = {};
	const createName = pickTool(names, /case_create|create_case/i);
	if (!createName) return {
		ok: false,
		error: "Discovered catalog has no case-create tool. Refusing to invent Core behavior.",
		steps,
		hashes,
		ids
	};
	const casePayload = syntheticCasePayload();
	hashes.case_create = payloadHash(casePayload);
	const created = await callMcpTool(createName, casePayload);
	const caseId = created.ok ? idFrom(created.result) : void 0;
	if (caseId) ids.case_id = caseId;
	steps.push({
		tool: createName,
		ok: created.ok,
		detail: created.ok ? `created ${caseId ?? "case"}` : created.error
	});
	if (!created.ok) return {
		ok: false,
		error: created.error,
		steps,
		hashes,
		ids
	};
	const loopName = pickTool(names, /create_general_problem_loop|problem_loop_create/i);
	if (!loopName) return {
		ok: true,
		steps: [...steps, {
			tool: "loop_create",
			ok: false,
			detail: "No loop-create tool in catalog; case exists. Refusing to invent freeze."
		}],
		hashes,
		ids
	};
	const loopPayload = syntheticLoopPayload();
	hashes.loop_create = payloadHash(loopPayload);
	const looped = await callMcpTool(loopName, loopPayload);
	const loopId = looped.ok ? idFrom(looped.result) : void 0;
	if (loopId) ids.loop_id = loopId;
	steps.push({
		tool: loopName,
		ok: looped.ok,
		detail: looped.ok ? `loop ${loopId ?? "created"}` : looped.error
	});
	if (!looped.ok) return {
		ok: false,
		error: looped.error,
		steps,
		hashes,
		ids
	};
	const verifyName = pickTool(names, /verify_general_problem_loop/i);
	if (verifyName && loopId) {
		const verified = await callMcpTool(verifyName, { loop_id: loopId });
		const valid = Boolean(verified.ok && verified.result && typeof verified.result === "object" && verified.result.valid);
		hashes.loop_verify = payloadHash({ loop_id: loopId });
		const verifyError = verified.ok ? valid ? void 0 : "Loop verify failed" : verified.error;
		steps.push({
			tool: verifyName,
			ok: verified.ok && valid,
			detail: verified.ok ? valid ? "Core hashes verified" : "Core returned invalid" : verified.error
		});
		return {
			ok: verified.ok && valid,
			error: verifyError,
			steps,
			hashes,
			ids
		};
	}
	return {
		ok: created.ok && looped.ok,
		steps,
		hashes,
		ids
	};
}
//#endregion
export { studentConfig as a, deriveHealthUrl as c, callMcpTool, guidedPlanPayload, redactSecrets as i, mcpConfig as n, teacherConfig as o, payloadHash, probeMcp, publicRoleStatus as r, runSyntheticCase, EQUAL_BUDGET as s, apiKeyFor as t };
