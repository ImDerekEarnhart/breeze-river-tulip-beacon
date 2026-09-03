import { a as POLICY_VERSION, d as routeWhenStudentMissing, l as TEACHER_ROUTE_EVENT, o as RETRIEVE_PROVENANCE, s as RETRIEVE_STEP_TITLE, u as routeAfterVerify } from "./roles-CnJYu5Ec.mjs";
import { t as CORE_LANGUAGE_ADAPTERS } from "./pipeline-BKV44rHi.mjs";
import { n as runFlmDemo } from "./demo.server-DyfdvfEY.mjs";
import { i as initialDesktop, r as applyDesk } from "./desktop-DqRBeHU8.mjs";
import { a as studentConfig, c as deriveHealthUrl, callMcpTool, guidedPlanPayload, i as redactSecrets, n as mcpConfig, o as teacherConfig, payloadHash, probeMcp, r as publicRoleStatus, s as EQUAL_BUDGET, t as apiKeyFor } from "./mcp.server-DDOhHMm3.mjs";
import { t as CORPUS } from "./corpus-CUgoZ7aV.mjs";
import { t as CORE_PROOF } from "./core-proof-C1GwXE91.mjs";
import { a as diagnoseWorld, i as diagnoseSuite, n as ORB1_OPERATORS, o as localLanguageSnapshot, r as admitOperator, t as LOCAL_FIBER_WORLDS } from "./admit-Ck2WKpPY.mjs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
//#region node_modules/.nitro/vite/services/ssr/assets/orchestrator.server-CEagMZID.js
/**
* Lexical retrieval (BM25 + title/tag rerank).
* This module is the retrieval subsystem. It is not the Language Tower,
* not embeddings, not pgvector, and does not issue LANGUAGE_LIMIT certificates.
*/
var STOP = /* @__PURE__ */ new Set([
	"the",
	"a",
	"an",
	"and",
	"or",
	"to",
	"of",
	"in",
	"on",
	"for",
	"is",
	"it",
	"as",
	"be",
	"by",
	"with",
	"that",
	"this",
	"from",
	"are",
	"was",
	"at",
	"not",
	"into",
	"than",
	"then",
	"its"
]);
function tokenize(text) {
	return text.toLowerCase().replace(/[^a-z0-9\s/+.-]/g, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
}
var DOC_TOKENS = CORPUS.map((d) => tokenize(`${d.title} ${d.tags.join(" ")} ${d.text}`));
var DF = /* @__PURE__ */ new Map();
for (const tokens of DOC_TOKENS) for (const t of new Set(tokens)) DF.set(t, (DF.get(t) ?? 0) + 1);
var N = CORPUS.length;
var K1 = 1.4;
var B = .75;
var AVG_LEN = DOC_TOKENS.reduce((s, t) => s + t.length, 0) / N;
function bm25(query, docIndex) {
	const tokens = DOC_TOKENS[docIndex] ?? [];
	const tf = /* @__PURE__ */ new Map();
	for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
	const dl = tokens.length || 1;
	let score = 0;
	for (const q of query) {
		const f = tf.get(q) ?? 0;
		if (!f) continue;
		const df = DF.get(q) ?? .5;
		const idf = Math.log(1 + (N - df + .5) / (df + .5));
		const denom = f + K1 * (.25 + B * (dl / AVG_LEN));
		score += idf * (f * 2.4 / denom);
	}
	return score;
}
function rerank(query, docs) {
	const q = tokenize(query);
	return docs.map((d) => {
		const titleHits = tokenize(d.title).filter((t) => q.includes(t)).length;
		const tagHits = d.tags.filter((t) => q.includes(t.toLowerCase())).length;
		return {
			...d,
			score: d.score + titleHits * 1.8 + tagHits * 1.1
		};
	}).sort((a, b) => b.score - a.score);
}
function retrieve(query, limit = 5) {
	const q = tokenize(query);
	if (q.length === 0) return [];
	return rerank(query, CORPUS.map((doc, i) => ({
		id: doc.id,
		title: doc.title,
		text: doc.text,
		tags: doc.tags,
		score: bm25(q, i)
	})).filter((d) => d.score > 0).sort((a, b) => b.score - a.score).slice(0, 12)).slice(0, limit);
}
function corpusStats() {
	return {
		documents: CORPUS.length,
		tokens: DOC_TOKENS.reduce((s, t) => s + t.length, 0),
		tags: [...new Set(CORPUS.flatMap((d) => d.tags))].length
	};
}
var BANNED = /\b(os|sys|subprocess|socket|pathlib|shutil|requests|http|urllib|ctypes|multiprocessing|pty|fcntl|importlib|builtins|eval|exec|open|compile|__import__|globals|locals|input|file|breakpoint)\b/i;
function looksDangerous(code) {
	if (code.length > 3500) return "Code exceeds sandbox limit.";
	if (BANNED.test(code)) return "Policy engine blocked a disallowed name.";
	if (/[\\/]etc[\\/]|[\\/]proc[\\/]|[\\/]sys[\\/]/.test(code)) return "Policy engine blocked a filesystem path.";
	return null;
}
function runPythonProcess(code) {
	return new Promise((resolve) => {
		const child = spawn("python3", [
			"-I",
			"-c",
			"import sys; exec(sys.stdin.read(), {'__name__':'__sandbox__'})"
		], {
			timeout: 2500,
			env: {
				PATH: "/usr/bin:/bin",
				LANG: "C.UTF-8"
			},
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		let out = "";
		let err = "";
		child.stdout.on("data", (d) => {
			out += d.toString();
		});
		child.stderr.on("data", (d) => {
			err += d.toString();
		});
		child.on("error", (e) => {
			resolve({
				ok: false,
				output: e.message
			});
		});
		child.on("close", (codeExit) => {
			const text = `${out}${err ? (out ? "\n" : "") + err : ""}`.trim();
			resolve({
				ok: codeExit === 0,
				output: (text || `(exit ${codeExit})`).slice(0, 6e3)
			});
		});
		child.stdin.write(code);
		child.stdin.end();
	});
}
function jsMathFallback(code) {
	const expr = code.replace(/print\((.*)\)/gs, "$1").replace(/\*\*/g, "^").trim();
	if (!/^[0-9+\-*/^().,\s]+$/.test(expr.replace(/\^/g, "**"))) return {
		ok: false,
		output: "Sandbox worker unavailable; only arithmetic could be evaluated locally."
	};
	try {
		const js = expr.replace(/\^/g, "**");
		const value = Function(`"use strict"; return (${js});`)();
		return {
			ok: true,
			output: String(value)
		};
	} catch (e) {
		return {
			ok: false,
			output: e instanceof Error ? e.message : "eval failed"
		};
	}
}
async function runSandbox(code) {
	const blocked = looksDangerous(code);
	if (blocked) return {
		ok: false,
		output: blocked
	};
	try {
		const result = await runPythonProcess(code);
		if (result.ok || result.output) return result;
	} catch {}
	return jsMathFallback(code);
}
var TOOL_SCHEMAS = [
	{
		name: "sandbox",
		description: "Run short Python in an isolated worker. Use for arithmetic, lists, and numeric checks. No files, no network, no OS.",
		arguments: { code: "python source" }
	},
	{
		name: "retrieve",
		description: "Search the retrieval corpus (BM25 + rerank). Not the Language Tower.",
		arguments: { query: "search query" }
	},
	{
		name: "memory_read",
		description: "Read a working or episodic memory item by id or keyword.",
		arguments: { query: "id or keyword" }
	},
	{
		name: "memory_write",
		description: "Write a short note into working memory for this run.",
		arguments: {
			title: "title",
			body: "body"
		}
	},
	{
		name: "orbita_status",
		description: "Inspect governed-experiment primitives, ORB-L adapters, and the local language snapshot. Does not freeze or promote.",
		arguments: { topic: "optional focus" }
	},
	{
		name: "fiber_diagnose",
		description: "Run the local finite fiber-collision auditor on SUM-GT, XOR-PAIR, AB-OK, LEAK-O, CLOCK, NONE, or suite. Not LANGUAGE_LIMIT. Not Opaque Fiber v1.0.1.",
		arguments: { world: "world id or suite" }
	},
	{
		name: "orb1_admit",
		description: "Local Q(i)[Z^d] operator admission. Admit D, exact T_u on the Q(i) unit circle, rational directional D. Quarantine √2 and π/4 as coefficient-ring limits. Not Core LANGUAGE_LIMIT. Never EARNED.",
		arguments: { operator: "coordinate_derivation|exact_translation|physical_derivative_sqrt2|shift_pi_over_4" }
	},
	{
		name: "flm_audit",
		description: "Local Fiber Lattice Machine kernel demo: refine, quotient, route, observe, or self_review. Finite worlds only. Candidates are inert until exact-hash external admission. Not Hodgeform Core. Never executes OBSERVE.",
		arguments: { scenario: "refine|quotient|route|observe|self_review" }
	},
	{
		name: "desktop",
		description: "SIMULATED PocketDesktop. action=status|start|stop|screenshot|click|type|launch. Not a real VM. Approved apps: chromium, files, terminal, calculator. No root.",
		arguments: {
			action: "status|start|stop|screenshot|click|type|launch",
			x: "px",
			y: "px",
			text: "keys",
			app: "allow-listed app"
		}
	}
];
var ALLOWED = new Set(TOOL_SCHEMAS.map((t) => t.name));
async function executeTool(call, memory, desk = initialDesktop()) {
	if (!ALLOWED.has(call.name)) return {
		result: {
			name: call.name,
			ok: false,
			output: "ToolDenied: not in ALLOWED_TOOLS"
		},
		desk
	};
	if (call.name === "sandbox") {
		const code = call.arguments.code ?? call.arguments.source ?? "";
		if (!code.trim()) return {
			result: {
				name: "sandbox",
				ok: false,
				output: "Missing code"
			},
			desk
		};
		const ran = await runSandbox(code);
		return {
			result: {
				name: "sandbox",
				ok: ran.ok,
				output: ran.output
			},
			desk
		};
	}
	if (call.name === "retrieve") return {
		result: {
			name: "retrieve",
			ok: true,
			output: retrieve(call.arguments.query ?? "", 4).map((d) => `[${d.id}] ${d.title}\n${d.text.slice(0, 420)}`).join("\n\n")
		},
		desk
	};
	if (call.name === "memory_read") {
		const q = (call.arguments.query ?? "").toLowerCase();
		const hits = memory.filter((m) => m.id.includes(q) || m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q) || m.kind.includes(q));
		return {
			result: {
				name: "memory_read",
				ok: true,
				output: hits.length ? hits.slice(0, 6).map((m) => `[${m.kind}/${m.id}] ${m.title}: ${m.body}`).join("\n") : "No matching memory."
			},
			desk
		};
	}
	if (call.name === "memory_write") return {
		result: {
			name: "memory_write",
			ok: true,
			output: `stored:${call.arguments.title ?? "note"}`
		},
		desk
	};
	if (call.name === "orbita_status") {
		const snap = localLanguageSnapshot();
		return {
			result: {
				name: "orbita_status",
				ok: true,
				output: [
					"Core primitives: case_context, compile_plan, submit_plan, get_plan, approve_plan, run_discovery, freeze_external_experiment, record_evaluation.",
					"Frozen plans are SHA-256 hashed and immutable. Ordinary chat should not enter this path.",
					`Language adapters (Core tools, not invented here): ${CORE_LANGUAGE_ADAPTERS.join(", ")}.`,
					`Local snapshot ${snap.language_id} ${snap.version}. machine=${snap.machine.kind}. not_the_tower_vm=${snap.machine.not_the_tower_vm}. promotion_enabled=${snap.promotion_enabled}.`,
					"Local fiber auditor is a finite exact control. It does not issue LANGUAGE_LIMIT or SEARCH_FAILURE. The Tower may not promote itself.",
					"ORB-1 is a local Q(i) coefficient-ring gate. Quarantine of √2 and π/4 is not a Core LANGUAGE_LIMIT and is never EARNED.",
					"FLM is a local finite representation kernel. REFINE/QUOTIENT/OBSERVE/MERGE. Candidates do not self-admit. Not Core."
				].join("\n")
			},
			desk
		};
	}
	if (call.name === "fiber_diagnose") {
		const id = (call.arguments.world ?? call.arguments.query ?? "suite").trim();
		if (!id || id.toLowerCase() === "suite") {
			const suite = diagnoseSuite(LOCAL_FIBER_WORLDS);
			const rows = suite.audits.map((a) => `${a.worldId} ${a.status} expected_ok=${a.matchesExpected} recoveries=${a.admittedRecoverySets.map((s) => s.join("+")).join(";") || "-"} limit=${a.languageLimitIssued}`).join("\n");
			return {
				result: {
					name: "fiber_diagnose",
					ok: true,
					output: `Local suite accuracy ${suite.statusAccuracy} false_holes=${suite.falseHoles} missed=${suite.missedHoles} languageLimitIssued=${suite.languageLimitIssued}\nNot Opaque Fiber v1.0.1.\n${rows}`
				},
				desk
			};
		}
		const world = LOCAL_FIBER_WORLDS.find((w) => w.id.toLowerCase() === id.toLowerCase());
		if (!world) return {
			result: {
				name: "fiber_diagnose",
				ok: false,
				output: `Unknown world ${id}. Use SUM-GT, XOR-PAIR, AB-OK, LEAK-O, CLOCK, NONE, or suite.`
			},
			desk
		};
		const audit = diagnoseWorld(world);
		return {
			result: {
				name: "fiber_diagnose",
				ok: true,
				output: JSON.stringify({
					worldId: audit.worldId,
					status: audit.status,
					matchesExpected: audit.matchesExpected,
					witnesses: audit.witnesses,
					admittedRecoverySets: audit.admittedRecoverySets,
					provenance: audit.provenance,
					scopeClaim: audit.scopeClaim,
					languageLimitIssued: audit.languageLimitIssued,
					searchFailureIssued: audit.searchFailureIssued,
					notes: audit.notes
				})
			},
			desk
		};
	}
	if (call.name === "orb1_admit") {
		const raw = (call.arguments.operator ?? call.arguments.query ?? call.arguments.world ?? "").trim();
		if (!raw || raw.toLowerCase() === "list") return {
			result: {
				name: "orb1_admit",
				ok: true,
				output: `Local operators: ${ORB1_OPERATORS.join(", ")}. Not Core LANGUAGE_LIMIT. Never EARNED.`
			},
			desk
		};
		const decision = admitOperator(raw);
		return {
			result: {
				name: "orb1_admit",
				ok: true,
				output: JSON.stringify(decision)
			},
			desk
		};
	}
	if (call.name === "flm_audit") {
		const raw = (call.arguments.scenario ?? call.arguments.query ?? call.arguments.world ?? "refine").trim();
		const demo = runFlmDemo(raw);
		return {
			result: {
				name: "flm_audit",
				ok: true,
				output: JSON.stringify(demo)
			},
			desk
		};
	}
	if (call.name === "desktop") {
		const action = (call.arguments.action ?? "status").toLowerCase();
		let current = desk;
		const notes = [];
		if (current.status !== "running" && (action === "screenshot" || action === "click" || action === "type" || action === "launch")) {
			const booted = applyDesk(current, { action: "start" });
			current = booted.snapshot;
			notes.push(booted.output.split("\n")[0] ?? "started");
		}
		const applied = applyDesk(current, {
			action,
			x: call.arguments.x ? Number(call.arguments.x) : void 0,
			y: call.arguments.y ? Number(call.arguments.y) : void 0,
			text: call.arguments.text,
			app: call.arguments.app
		});
		const output = notes.length ? `${notes.join("\n")}\n${applied.output}` : applied.output;
		return {
			result: {
				name: "desktop",
				ok: applied.ok,
				output
			},
			desk: applied.snapshot
		};
	}
	return {
		result: {
			name: call.name,
			ok: false,
			output: "Unknown tool"
		},
		desk
	};
}
function usageOf(raw) {
	const u = raw?.usage;
	const num = (v) => typeof v === "number" && Number.isFinite(v) ? v : null;
	return {
		promptTokens: num(u?.prompt_tokens),
		completionTokens: num(u?.completion_tokens),
		totalTokens: num(u?.total_tokens)
	};
}
var OpenAICompatibleProvider = class {
	role;
	config;
	inflight = { n: 0 };
	constructor(config) {
		this.role = config.role;
		this.config = config;
	}
	async chat(req) {
		const started = Date.now();
		const model = this.config.modelId || "unspecified";
		if (!this.config.configured) return {
			ok: false,
			error: `${this.role} provider is not configured (no base URL).`,
			code: "not_configured",
			provider: this.config.provider,
			model,
			latencyMs: Date.now() - started
		};
		if (this.inflight.n >= this.config.maxConcurrency) return {
			ok: false,
			error: `${this.role} concurrency limit (${this.config.maxConcurrency}) reached.`,
			code: "fail_closed",
			provider: this.config.provider,
			model,
			latencyMs: Date.now() - started
		};
		const key = apiKeyFor(this.config);
		const url = `${this.config.baseUrl}/chat/completions`;
		const body = {
			model,
			messages: req.messages,
			max_tokens: req.maxTokens ?? this.config.maxOutputTokens,
			temperature: req.temperature ?? this.config.temperature
		};
		if (req.json) body.response_format = { type: "json_object" };
		const timeoutMs = req.timeoutMs ?? this.config.timeoutSeconds * 1e3;
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), timeoutMs);
		this.inflight.n += 1;
		try {
			const headers = { "Content-Type": "application/json" };
			if (key) headers.Authorization = `Bearer ${key}`;
			const res = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
				signal: ctrl.signal
			});
			const rawText = await res.text();
			if (!res.ok) return {
				ok: false,
				error: redactSecrets(`${this.config.baseHost} HTTP ${res.status}: ${rawText.slice(0, 240)}`),
				code: "http",
				provider: this.config.provider,
				model,
				latencyMs: Date.now() - started
			};
			let data;
			try {
				data = JSON.parse(rawText);
			} catch {
				return {
					ok: false,
					error: "Provider returned non-JSON body",
					code: "parse",
					provider: this.config.provider,
					model,
					latencyMs: Date.now() - started
				};
			}
			return {
				ok: true,
				text: data.choices?.[0]?.message?.content ?? "",
				model: data.model ?? model,
				provider: this.config.provider,
				usage: usageOf(data),
				latencyMs: Date.now() - started
			};
		} catch (e) {
			const aborted = e instanceof Error && e.name === "AbortError";
			return {
				ok: false,
				error: redactSecrets(aborted ? `${this.role} timed out after ${timeoutMs}ms` : e instanceof Error ? e.message : "fetch failed"),
				code: aborted ? "timeout" : "http",
				provider: this.config.provider,
				model,
				latencyMs: Date.now() - started
			};
		} finally {
			clearTimeout(timer);
			this.inflight.n -= 1;
		}
	}
};
var student = null;
var teacher = null;
function studentProvider() {
	student ??= new OpenAICompatibleProvider(studentConfig());
	return student;
}
function teacherProvider() {
	teacher ??= new OpenAICompatibleProvider(teacherConfig());
	return teacher;
}
function studentChat(messages, opts) {
	return studentProvider().chat({
		messages,
		maxTokens: opts?.maxTokens,
		json: true
	});
}
function teacherChat(messages, opts) {
	return teacherProvider().chat({
		messages,
		maxTokens: opts?.maxTokens,
		json: opts?.json ?? true
	});
}
function studentAvailable() {
	return studentProvider().config.configured;
}
function providerPublicStatus() {
	return {
		student: publicRoleStatus(studentProvider().config),
		teacher: publicRoleStatus(teacherProvider().config)
	};
}
function hostOf(url) {
	if (!url) return "";
	try {
		return new URL(url).host;
	} catch {
		return "";
	}
}
async function getJson(url, timeoutMs) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			method: "GET",
			headers: { Accept: "application/json" },
			signal: ctrl.signal,
			redirect: "manual"
		});
		const raw = await res.text();
		let json = null;
		try {
			json = raw ? JSON.parse(raw) : null;
		} catch {
			json = null;
		}
		return {
			status: res.status,
			json,
			raw: raw.slice(0, 240),
			contentType: res.headers.get("content-type") ?? ""
		};
	} finally {
		clearTimeout(timer);
	}
}
async function probeStudentHealth() {
	const cfg = studentConfig();
	const url = deriveHealthUrl(cfg.baseUrl, cfg.healthUrl);
	const started = Date.now();
	if (!cfg.configured || !url) return {
		configured: false,
		urlHost: "",
		ok: false,
		status: null,
		latencyMs: 0,
		models: [],
		error: "Student health URL is unset. Set STUDENT_BASE_URL and optionally STUDENT_HEALTH_URL."
	};
	try {
		const res = await getJson(url, 4e3);
		const models = (res.json?.data ?? []).map((m) => String(m.id ?? "")).filter(Boolean).slice(0, 8);
		const ok = res.status >= 200 && res.status < 300;
		return {
			configured: true,
			urlHost: hostOf(url),
			ok,
			status: res.status,
			latencyMs: Date.now() - started,
			models,
			error: ok ? void 0 : redactSecrets(`health HTTP ${res.status}: ${res.raw}`)
		};
	} catch (e) {
		return {
			configured: true,
			urlHost: hostOf(url),
			ok: false,
			status: null,
			latencyMs: Date.now() - started,
			models: [],
			error: redactSecrets(e instanceof Error ? e.message : "health probe failed")
		};
	}
}
async function probeHodgeformUiHealth(url) {
	const started = Date.now();
	if (!url) return {
		ok: false,
		host: "",
		latencyMs: 0,
		error: "No UI health URL"
	};
	try {
		const res = await getJson(url, 4e3);
		const body = res.json ?? {};
		const ok = res.status >= 200 && res.status < 300 && (body.status === "ok" || body.status === void 0);
		return {
			ok,
			host: hostOf(url),
			service: body.service,
			version: body.version,
			latencyMs: Date.now() - started,
			error: ok ? void 0 : redactSecrets(`UI health HTTP ${res.status}`)
		};
	} catch (e) {
		return {
			ok: false,
			host: hostOf(url),
			latencyMs: Date.now() - started,
			error: redactSecrets(e instanceof Error ? e.message : "UI health failed")
		};
	}
}
function sha256(text) {
	return createHash("sha256").update(text).digest("hex");
}
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
	const obj = value;
	return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
var RECEIPT_SCHEMA = "guided-receipt/1";
/** Canonical body for hashing. The hash field is excluded by construction. */
function unsignedReceiptBody(draft) {
	return {
		schemaVersion: RECEIPT_SCHEMA,
		id: draft.id,
		kind: draft.kind,
		runId: draft.runId,
		producer: draft.producer,
		createdAt: draft.createdAt,
		parentReceiptIds: [...draft.parentReceiptIds],
		provenance: [...draft.provenance],
		payload: draft.payload
	};
}
function canonicalUnsigned(draft) {
	return stableStringify(unsignedReceiptBody(draft));
}
function lastReceiptParents(receipts) {
	const last = receipts[receipts.length - 1];
	return last ? [last.id] : [];
}
function hashText(text) {
	return sha256(text);
}
function makeReceipt(draft) {
	return {
		...unsignedReceiptBody(draft),
		hash: sha256(canonicalUnsigned(draft))
	};
}
function emitReceipt(receipts, draft) {
	const rec = makeReceipt({
		...draft,
		parentReceiptIds: draft.parentReceiptIds ?? lastReceiptParents(receipts)
	});
	receipts.push(rec);
	return rec;
}
function step(kind, title, detail, extra) {
	return {
		id: crypto.randomUUID().slice(0, 8),
		kind,
		title,
		detail,
		latencyMs: extra?.latencyMs ?? 0,
		model: extra?.model,
		data: extra?.data
	};
}
function noteCall(calls, role, res) {
	const row = {
		role,
		provider: res.provider,
		model: res.model,
		ok: res.ok,
		latencyMs: res.latencyMs
	};
	calls.push(row);
	return row;
}
function failTrace(opts) {
	const receipts = opts.receipts ?? [];
	emitReceipt(receipts, {
		id: crypto.randomUUID(),
		kind: "control",
		runId: opts.id,
		producer: "guided-orchestrator",
		createdAt: Date.now(),
		provenance: ["fail-closed"],
		payload: {
			type: "control",
			event: "fail_closed",
			message: opts.message
		}
	});
	opts.steps.push(step("answer", "Fail closed", opts.message));
	return {
		id: opts.id,
		createdAt: opts.started,
		request: opts.request,
		mode: opts.mode,
		status: "error",
		error: opts.message,
		escalated: false,
		modelPath: "student",
		answer: opts.message,
		citations: [],
		confidence: 0,
		steps: opts.steps,
		retrieved: opts.retrieved,
		toolTrace: opts.toolTrace,
		desktop: opts.desk,
		tokensHint: `${opts.providerCalls?.length ?? 0} model calls`,
		totalMs: Date.now() - opts.started,
		providerCalls: opts.providerCalls,
		hodgeform: opts.hodgeform,
		studentModel: opts.providerCalls?.find((c) => c.role === "student")?.model,
		teacherModel: opts.providerCalls?.find((c) => c.role === "teacher")?.model,
		receipts,
		route: opts.route ?? {
			path: "fail_closed",
			reason: "student_unconfigured",
			teacherSubstituted: false,
			policyVersion: "guided-route/1"
		}
	};
}
function mcpMeta(probe) {
	return {
		connected: probe.ok,
		status: probe.status,
		host: probe.urlHost,
		tools: probe.tools.map((t) => t.name),
		error: probe.error,
		authMode: probe.authMode
	};
}
function parseDecision(raw) {
	const trimmed = raw.trim();
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		const obj = JSON.parse(trimmed.slice(start, end + 1));
		const action = obj.action === "tool" || obj.action === "escalate" || obj.action === "answer" ? obj.action : "answer";
		const toolRaw = obj.tool;
		let tool;
		if (toolRaw?.name) {
			const args = {};
			if (toolRaw.arguments && typeof toolRaw.arguments === "object") for (const [k, v] of Object.entries(toolRaw.arguments)) args[k] = typeof v === "string" ? v : JSON.stringify(v);
			tool = {
				name: toolRaw.name,
				arguments: args
			};
		}
		return {
			thought: String(obj.thought ?? ""),
			confidence: Math.max(0, Math.min(1, Number(obj.confidence ?? .5))),
			action,
			tool,
			answer: obj.answer ? String(obj.answer) : void 0,
			citations: Array.isArray(obj.citations) ? obj.citations.map((c) => String(c)) : void 0
		};
	} catch {
		return null;
	}
}
var STUDENT_SYS = `You are the Guided worker role in Hodgeform. You are a replaceable reasoning provider, not Hodgeform Core and not a desktop agent.
Do not claim to be a locally hosted SLM, a vLLM process, or a specific branded model. If asked which model you are, say you are the worker role and that the runtime model id is whatever the provider reports in metadata — never invent a model name.
Respond ONLY as JSON:
{
  "thought": "short",
  "confidence": 0.0-1.0,
  "action": "answer" | "tool" | "escalate",
  "tool": { "name": "sandbox"|"retrieve"|"memory_read"|"memory_write"|"orbita_status"|"fiber_diagnose"|"orb1_admit"|"flm_audit"|"desktop", "arguments": { } },
  "answer": "final answer if action=answer",
  "citations": ["doc-id"]
}
Tools: ${TOOL_SCHEMAS.map((t) => `${t.name}: ${t.description}`).join(" | ")}
Rules:
- Use sandbox for numeric work. Python only, no files/network.
- PocketDesktop in this app is a SIMULATION. Never sudo or ssh.
- fiber_diagnose is a local finite table auditor. It is not LANGUAGE_LIMIT and not Opaque Fiber v1.0.1.
- orb1_admit is a local Q(i) coefficient-ring gate. Quarantine of √2 or π/4 is not Core LANGUAGE_LIMIT and is never EARNED.
- flm_audit is a local Fiber Lattice Machine kernel. Finite worlds only. Candidates do not self-admit. OBSERVE never executes. Not Hodgeform Core.
- Cite retrieved doc ids when you used them.
- Escalate if confidence < 0.55, the task is experimental design, or you cannot verify. Escalation is explicit, never a silent teacher fallback.
- Keep answers tight and specific. No markdown tables.
- Governed claims belong in Hodgeform Core via MCP, not in this prompt.`;
var TEACHER_SYS = `You are the optional teacher role in Hodgeform Guided — a replaceable stronger provider, not Hodgeform Core.
Do not auto-approve, mutate frozen artifacts, or broaden claim scope.
Respond ONLY as JSON with keys thought, confidence, action, answer, citations, and optionally plan, discovery, evaluation_pass, evaluation_notes.
If asked to propose a governed plan, put the full plan in "plan" with Hypothesis, Method, Success, Falsification, Sandbox steps. The plan is a proposal until Hodgeform Core freezes it.
Be precise. Prefer falsifiable statements.`;
function docsBlock(docs) {
	if (!docs.length) return "No retrieved passages.";
	return docs.map((d) => `[${d.id}] ${d.title} (score ${d.score.toFixed(2)})\n${d.text.slice(0, 700)}`).join("\n\n");
}
function verify(request, decision, tools) {
	if (!decision.answer || decision.answer.trim().length < 8) return {
		pass: false,
		reason: "Empty or too-short answer"
	};
	if (decision.confidence < .55) return {
		pass: false,
		reason: `Confidence ${decision.confidence.toFixed(2)} below threshold`
	};
	if (/sandbox|calculat|compound|\d+\s*%/.test(request) && !tools.some((t) => t.name === "sandbox" && t.ok)) {
		if (/\b\d+\b/.test(decision.answer) && decision.confidence >= .8) return {
			pass: true,
			reason: "Numeric answer with high confidence"
		};
	}
	return {
		pass: true,
		reason: "Answer present and confidence above threshold"
	};
}
function seedMemory() {
	return [{
		id: "proc-sandbox",
		kind: "procedural",
		title: "Sandbox policy",
		body: "Only sandbox, retrieve, memory, orbita_status, fiber_diagnose, orb1_admit, flm_audit. No shell. Destroy worker after result.",
		createdAt: Date.now() - 864e5
	}, {
		id: "proc-escalate",
		kind: "procedural",
		title: "Escalation rules",
		body: "Escalate when confidence < 0.55, governed research, or verification fails. Escalation is an explicit teacher route with a reason. A missing student is fail-closed, not a teacher fallback.",
		createdAt: Date.now() - 864e5
	}];
}
function getSystemStatusHandler() {
	const stats = corpusStats();
	const s = studentProvider().config;
	const t = teacherProvider().config;
	return {
		ai: s.configured,
		student: s.configured ? `${s.modelId}${s.modelRevision ? `@${s.modelRevision}` : ""} @ ${s.baseHost} · role student` : "not configured — set STUDENT_BASE_URL, STUDENT_MODEL_ID, STUDENT_HEALTH_URL",
		teacher: t.configured ? `${t.modelId} @ ${t.baseHost} · role teacher` : "not configured",
		retrieval: `local lexical BM25 · ${stats.documents} docs · not the Language Tower`,
		sandbox: "policy engine · isolated python",
		orbita: "Hodgeform Core via MCP · fail-closed without server OAuth",
		desktop: "SIMULATED canvas · not a cloud VM"
	};
}
async function getInfrastructureHandler() {
	const cfg = mcpConfig();
	const [mcp, studentHealth, uiHealth] = await Promise.all([
		probeMcp(),
		probeStudentHealth(),
		probeHodgeformUiHealth(cfg.uiHealthUrl)
	]);
	const providers = providerPublicStatus();
	const studentReady = providers.student.configured && studentHealth.ok && Boolean(providers.student.modelIdConfigured);
	const mcpReady = mcp.ok && mcp.authMode !== "missing";
	const teacherReady = providers.teacher.configured;
	const comparisonReady = studentReady && mcpReady && teacherReady;
	return {
		...getSystemStatusHandler(),
		providers,
		studentHealth: {
			configured: studentHealth.configured,
			ok: studentHealth.ok,
			host: studentHealth.urlHost,
			models: studentHealth.models,
			latencyMs: studentHealth.latencyMs,
			error: studentHealth.error
		},
		uiHealth: {
			ok: uiHealth.ok,
			host: uiHealth.host,
			service: uiHealth.service,
			version: uiHealth.version,
			latencyMs: uiHealth.latencyMs,
			error: uiHealth.error
		},
		mcp: {
			host: mcp.urlHost,
			status: mcp.status,
			auth: mcp.auth,
			authMode: mcp.authMode,
			connected: mcp.ok,
			tools: mcp.tools.map((x) => x.name),
			error: mcp.error,
			latencyMs: mcp.latencyMs
		},
		desktopSimulated: true,
		proof: {
			appMcpReady: mcpReady,
			operatorChatChannel: CORE_PROOF.channel,
			notFromAppMcp: CORE_PROOF.notFromAppMcp,
			caseId: CORE_PROOF.syntheticCase.id,
			loopId: CORE_PROOF.syntheticLoop.id,
			loopValid: CORE_PROOF.syntheticLoop.valid,
			protocolLoopId: CORE_PROOF.protocolLoop.id,
			protocolValid: CORE_PROOF.protocolLoop.valid,
			coreProduct: CORE_PROOF.product,
			coreVersion: CORE_PROOF.version
		},
		benchmark: {
			executed: false,
			equalBudget: { ...EQUAL_BUDGET },
			protocolLoopId: CORE_PROOF.protocolLoop.id,
			ready: comparisonReady,
			conditions: [
				{
					id: "grok_alone",
					ready: teacherReady,
					blocked: !teacherReady,
					reason: teacherReady ? "Teacher/xAI is configured. Comparison still waits for student GPU + Core OAuth." : "Teacher/xAI is not configured."
				},
				{
					id: "vllm_student",
					ready: studentReady,
					blocked: !studentReady,
					reason: studentReady ? "Student GPU health is live." : "Set STUDENT_BASE_URL, STUDENT_MODEL_ID, and a live STUDENT_HEALTH_URL. Grok is not the student."
				},
				{
					id: "grok_vllm_hodgeform",
					ready: studentReady && mcpReady,
					blocked: !(studentReady && mcpReady),
					reason: studentReady && mcpReady ? "Student GPU and tenant server OAuth are live." : "Needs live student GPU and a tenant-bound server credential. Browser tokens are refused."
				}
			]
		}
	};
}
async function executeRun(data) {
	const started = Date.now();
	const steps = [];
	const toolTrace = [];
	const memory = seedMemory();
	let desk = data.desktop ?? initialDesktop();
	const id = crypto.randomUUID();
	const providerCalls = [];
	const receipts = [];
	const t0 = Date.now();
	const retrieved = retrieve(data.request, 5);
	steps.push(step("retrieve", RETRIEVE_STEP_TITLE, `Top ${retrieved.length} passages after BM25 + rerank`, {
		latencyMs: Date.now() - t0,
		data: {
			ids: retrieved.map((d) => d.id),
			titles: retrieved.map((d) => d.title)
		}
	}));
	emitReceipt(receipts, {
		id: crypto.randomUUID(),
		kind: "context",
		runId: id,
		producer: "guided-retrieve",
		createdAt: started,
		provenance: [RETRIEVE_PROVENANCE],
		payload: {
			type: "context",
			docIds: retrieved.map((d) => d.id),
			titles: retrieved.map((d) => d.title),
			backend: "bm25-rerank"
		}
	});
	if (data.mode === "governed") return runGoverned({
		id,
		started,
		request: data.request,
		mode: data.mode,
		retrieved,
		steps,
		toolTrace,
		memory,
		desk,
		providerCalls,
		receipts
	});
	if (!studentAvailable()) {
		const route = routeWhenStudentMissing("fast");
		return failTrace({
			id,
			started,
			request: data.request,
			mode: data.mode,
			retrieved,
			steps,
			toolTrace,
			desk,
			message: "Student provider is not configured. Set STUDENT_BASE_URL (vLLM), STUDENT_MODEL_ID, and STUDENT_HEALTH_URL. Refusing to pretend Grok is the student.",
			providerCalls,
			receipts,
			route
		});
	}
	steps.push(step("route", "Model router", "Student first · teacher only as explicit escalation", { data: { choice: "student" } }));
	const historyMsgs = data.history.map((h) => ({
		role: h.role,
		content: h.content
	}));
	const baseMsgs = [
		{
			role: "system",
			content: STUDENT_SYS
		},
		...historyMsgs,
		{
			role: "user",
			content: `Runtime: role=student configured_model=${studentProvider().config.modelId} host=${studentProvider().config.baseHost}\nRequest:\n${data.request}\n\nRetrieved context:\n${docsBlock(retrieved)}`
		}
	];
	let apiCalls = 0;
	let raw = await studentChat(baseMsgs);
	apiCalls += 1;
	noteCall(providerCalls, "student", raw);
	if (!raw.ok) return failTrace({
		id,
		started,
		request: data.request,
		mode: data.mode,
		retrieved,
		steps,
		toolTrace,
		desk,
		message: `Student provider fail-closed: ${raw.error}`,
		providerCalls,
		receipts,
		route: {
			path: "fail_closed",
			reason: "student_provider_error",
			teacherSubstituted: false,
			policyVersion: POLICY_VERSION
		}
	});
	let parseFailed = false;
	let decision = parseDecision(raw.text);
	if (!decision) {
		parseFailed = true;
		decision = {
			thought: "Could not parse structured output",
			confidence: .2,
			action: "escalate",
			answer: raw.text.slice(0, 1200)
		};
	}
	steps.push(step("reason", "Student reason", `${decision.thought || "Structured action"} · model ${raw.model}`, {
		model: "student",
		data: {
			action: decision.action,
			confidence: decision.confidence,
			modelId: raw.model,
			provider: raw.provider
		}
	}));
	let rounds = 0;
	while (decision.action === "tool" && decision.tool && rounds < 2 && apiCalls < 3) {
		const tTool = Date.now();
		const executed = await executeTool(decision.tool, memory, desk);
		desk = executed.desk;
		const result = executed.result;
		toolTrace.push(result);
		if (decision.tool.name === "memory_write") memory.push({
			id: `work-${memory.length}`,
			kind: "working",
			title: decision.tool.arguments.title ?? "note",
			body: decision.tool.arguments.body ?? "",
			createdAt: Date.now()
		});
		steps.push(step("tool", `Sandbox / tool · ${decision.tool.name}`, result.output.slice(0, 280), {
			latencyMs: Date.now() - tTool,
			data: {
				ok: result.ok,
				name: result.name
			}
		}));
		emitReceipt(receipts, {
			id: crypto.randomUUID(),
			kind: "execution",
			runId: id,
			producer: "guided-tools",
			createdAt: Date.now(),
			provenance: [`tool:${result.name}`],
			payload: {
				type: "execution",
				capability: result.name,
				ok: result.ok,
				outputPreview: result.output.slice(0, 240),
				outputHash: hashText(result.output)
			}
		});
		if (result.name === "orb1_admit") {
			const op = decision.tool.arguments.operator ?? decision.tool.arguments.query ?? decision.tool.arguments.world ?? "";
			const adm = admitOperator(op);
			emitReceipt(receipts, {
				id: crypto.randomUUID(),
				kind: "admission",
				runId: id,
				producer: "guided-orb1",
				createdAt: Date.now(),
				provenance: ["orb1:q(i)[Z^d]"],
				payload: {
					type: "admission",
					operatorId: adm.operatorId,
					decision: adm.decision,
					ring: "Q(i)[Z^d]",
					coreLanguageLimit: false,
					earned: false
				}
			});
		}
		raw = await studentChat([
			...baseMsgs,
			{
				role: "assistant",
				content: JSON.stringify(decision)
			},
			{
				role: "user",
				content: `Tool ${result.name} ${result.ok ? "ok" : "failed"}:\n${result.output}\nContinue. JSON only.`
			}
		]);
		apiCalls += 1;
		if (!raw.ok) break;
		noteCall(providerCalls, "student", raw);
		decision = parseDecision(raw.text) ?? {
			thought: "parse fail after tool",
			confidence: .25,
			action: "escalate"
		};
		rounds += 1;
		steps.push(step("reason", "Student continue", decision.thought || decision.action, {
			model: "student",
			data: {
				action: decision.action,
				confidence: decision.confidence
			}
		}));
	}
	if (decision.action !== "tool" && (!decision.answer || decision.answer.trim().length < 8)) {
		const lastOk = [...toolTrace].reverse().find((t) => t.ok);
		if (lastOk) decision = {
			...decision,
			action: "answer",
			answer: lastOk.output,
			confidence: Math.max(decision.confidence, .7)
		};
	}
	const verdict = verify(data.request, decision, toolTrace);
	steps.push(step("verify", "Verifier", verdict.reason, { data: {
		pass: verdict.pass,
		confidence: decision.confidence
	} }));
	emitReceipt(receipts, {
		id: crypto.randomUUID(),
		kind: "verification",
		runId: id,
		producer: "guided-verifier",
		createdAt: Date.now(),
		provenance: ["local-verifier"],
		payload: {
			type: "verification",
			pass: verdict.pass,
			reason: verdict.reason,
			confidence: decision.confidence
		}
	});
	if ((decision.action === "escalate" || !verdict.pass || decision.confidence < .55) && apiCalls < 3) {
		const route = routeAfterVerify({
			pass: verdict.pass,
			action: decision.action,
			confidence: decision.confidence,
			parseFailed,
			studentAttemptId: id,
			studentModel: raw.model
		});
		steps.push(step("escalate", "Explicit teacher route", `reason=${route.reason} · policy ${route.policyVersion} · not a fallback`, {
			model: "teacher",
			data: { choice: route.reason }
		}));
		emitReceipt(receipts, {
			id: crypto.randomUUID(),
			kind: "control",
			runId: id,
			producer: "guided-router",
			createdAt: Date.now(),
			provenance: [`route:${route.reason}`],
			payload: {
				type: "control",
				event: TEACHER_ROUTE_EVENT,
				message: `reason=${route.reason} student_attempt_id=${id} teacherSubstituted=false`
			}
		});
		const tTeach = await teacherChat([{
			role: "system",
			content: TEACHER_SYS
		}, {
			role: "user",
			content: `Original request:\n${data.request}\n\nRetrieved:\n${docsBlock(retrieved)}\n\nStudent attempt:\n${JSON.stringify(decision)}\n\nTool trace:\n${toolTrace.map((t) => t.name + ": " + t.output).join("\n")}\n\nVerifier: ${verdict.reason}\nTeacher route reason: ${route.reason}\nProduce the corrected final answer as JSON with action=answer.`
		}]);
		apiCalls += 1;
		noteCall(providerCalls, "teacher", tTeach);
		if (!tTeach.ok) return failTrace({
			id,
			started,
			request: data.request,
			mode: data.mode,
			retrieved,
			steps,
			toolTrace,
			desk,
			message: `Teacher provider fail-closed: ${tTeach.error}`,
			providerCalls,
			receipts,
			route: {
				path: "fail_closed",
				reason: "teacher_provider_error",
				teacherSubstituted: false,
				policyVersion: POLICY_VERSION,
				studentAttemptId: id,
				studentModel: raw.model
			}
		});
		const teacherDec = parseDecision(tTeach.text);
		const answer = teacherDec?.answer || tTeach.text;
		const training = {
			id: `tr-${id.slice(0, 8)}`,
			prompt: data.request,
			studentAttempt: decision.answer || decision.thought || JSON.stringify(decision),
			teacherAnswer: answer,
			verification: "fail",
			createdAt: Date.now()
		};
		steps.push(step("answer", "Teacher answer", `Supervised completion · model ${tTeach.model}`, {
			model: "teacher",
			data: {
				modelId: tTeach.model,
				provider: tTeach.provider
			}
		}));
		return {
			id,
			createdAt: started,
			request: data.request,
			mode: data.mode,
			status: "ok",
			escalated: true,
			modelPath: "student→teacher",
			answer,
			citations: teacherDec?.citations ?? retrieved.map((d) => d.id).slice(0, 3),
			confidence: teacherDec?.confidence ?? .8,
			steps,
			retrieved,
			toolTrace,
			training,
			desktop: desk,
			tokensHint: `${apiCalls} model calls`,
			totalMs: Date.now() - started,
			studentModel: providerCalls.find((c) => c.role === "student" && c.ok)?.model,
			teacherModel: tTeach.model,
			providerCalls,
			receipts,
			route
		};
	}
	steps.push(step("answer", "Student answer", `Passed verification · model ${raw.model}`, {
		model: "student",
		data: {
			modelId: raw.model,
			provider: raw.provider
		}
	}));
	return {
		id,
		createdAt: started,
		request: data.request,
		mode: data.mode,
		status: "ok",
		escalated: false,
		modelPath: "student",
		answer: decision.answer || "No answer.",
		citations: decision.citations ?? retrieved.map((d) => d.id).slice(0, 3),
		confidence: decision.confidence,
		steps,
		retrieved,
		toolTrace,
		desktop: desk,
		tokensHint: `${apiCalls} model calls`,
		totalMs: Date.now() - started,
		studentModel: raw.model,
		providerCalls,
		receipts,
		route: {
			path: "student",
			reason: "fast_path",
			teacherSubstituted: false,
			policyVersion: POLICY_VERSION,
			studentModel: raw.model
		}
	};
}
async function runGoverned(opts) {
	const { id, started, request, retrieved, steps, toolTrace, providerCalls, receipts } = opts;
	let desk = opts.desk;
	const mcp = await probeMcp();
	steps.push(step("orbita", "Hodgeform MCP", mcp.ok ? `Connected · ${mcp.tools.length} tools` : mcp.error ?? mcp.status, { data: { ok: mcp.ok } }));
	if (!mcp.ok) return failTrace({
		id,
		started,
		request,
		mode: opts.mode,
		retrieved,
		steps,
		toolTrace,
		desk,
		message: `Governed execution is fail-closed. ${mcp.error ?? "Hodgeform Core MCP is not authenticated."}`,
		providerCalls,
		hodgeform: mcpMeta(mcp),
		receipts,
		route: {
			path: "fail_closed",
			reason: "mcp_unauthenticated",
			teacherSubstituted: false,
			policyVersion: POLICY_VERSION
		}
	});
	const governedRoute = {
		path: "teacher",
		reason: "governed_plan",
		teacherSubstituted: false,
		policyVersion: POLICY_VERSION
	};
	steps.push(step("route", "Model router", "Governed path · Core owns freeze/approve; teacher only proposes", { data: { choice: "teacher" } }));
	emitReceipt(receipts, {
		id: crypto.randomUUID(),
		kind: "control",
		runId: id,
		producer: "guided-router",
		createdAt: Date.now(),
		provenance: ["route:governed_plan"],
		payload: {
			type: "control",
			event: "teacher_route",
			message: `reason=governed_plan teacherSubstituted=false`
		}
	});
	const planRes = await teacherChat([{
		role: "system",
		content: TEACHER_SYS
	}, {
		role: "user",
		content: `Create a governed experiment/analysis plan for:\n${request}\n\nCase context:\n${docsBlock(retrieved)}\n\nJSON with thought, plan (full text), answer (brief summary of what will be tested), confidence, citations.`
	}], {
		maxTokens: 900,
		json: true
	});
	noteCall(providerCalls, "teacher", planRes);
	if (!planRes.ok) return failTrace({
		id,
		started,
		request,
		mode: opts.mode,
		retrieved,
		steps,
		toolTrace,
		desk,
		message: `Teacher provider fail-closed: ${planRes.error}`,
		providerCalls,
		hodgeform: mcpMeta(mcp),
		receipts,
		route: {
			path: "fail_closed",
			reason: "teacher_provider_error",
			teacherSubstituted: false,
			policyVersion: POLICY_VERSION
		}
	});
	const planned = parseDecision(planRes.text);
	const planText = extractField(planRes.text, "plan") || planned?.answer || planRes.text;
	const names = new Set(mcp.tools.map((t) => t.name));
	const createName = [...names].find((n) => /case_create|create_case/i.test(n));
	const submitName = [...names].find((n) => /plan_submit|submit_plan|compile_plan/i.test(n));
	if (!createName || !submitName) return failTrace({
		id,
		started,
		request,
		mode: opts.mode,
		retrieved,
		steps,
		toolTrace,
		desk,
		message: "MCP catalog is missing case-create or plan-submit. Refusing to freeze or approve in this UI.",
		providerCalls,
		hodgeform: mcpMeta(mcp),
		receipts,
		route: {
			path: "fail_closed",
			reason: "mcp_catalog_incomplete",
			teacherSubstituted: false,
			policyVersion: POLICY_VERSION
		}
	});
	const casePayload = {
		name: request.slice(0, 120) || "Guided governed case",
		goal: request,
		domain_hint: "guided orchestrator / governed proposal"
	};
	const created = await callMcpTool(createName, casePayload);
	steps.push(step("orbita", createName, created.ok ? "Case opened in Core" : created.error, { data: { ok: created.ok } }));
	if (!created.ok) return failTrace({
		id,
		started,
		request,
		mode: opts.mode,
		retrieved,
		steps,
		toolTrace,
		desk,
		message: created.error,
		providerCalls,
		hodgeform: mcpMeta(mcp),
		receipts,
		route: governedRoute
	});
	const caseId = created.result?.case?.id || (typeof created.result === "object" && created.result && "id" in created.result ? String(created.result.id) : payloadHash(casePayload).slice(0, 12));
	const submitPayload = guidedPlanPayload({
		caseId,
		summary: planned?.thought || "Guided proposal",
		coverageNotes: "Proposed by Guided teacher role; Core freeze is authoritative.",
		candidates: [{
			kind: "other",
			inputs: { request },
			outcome: planned?.answer || "bounded test",
			assumptions: [],
			falsifier: "Empty result, denied tool, or no supporting evidence."
		}]
	});
	hashesNote(steps, payloadHash(submitPayload));
	const submitted = await callMcpTool(submitName, {
		...submitPayload,
		plan: planText
	});
	steps.push(step("orbita", submitName, submitted.ok ? "Plan submitted to Core" : submitted.error, { data: {
		ok: submitted.ok,
		planHash: payloadHash(submitPayload)
	} }));
	steps.push(step("answer", "Awaiting Core approval", "This orchestrator will not auto-approve. Exact-hash approval must happen in Hodgeform Core.", {
		model: "teacher",
		data: { modelId: planRes.model }
	}));
	return {
		id,
		createdAt: started,
		request,
		mode: opts.mode,
		status: submitted.ok ? "ok" : "error",
		error: submitted.ok ? void 0 : submitted.error,
		escalated: true,
		modelPath: "teacher",
		answer: submitted.ok ? `Plan proposed and submitted to Hodgeform Core (case ${caseId}). Not approved, not executed. Teacher model ${planRes.model}. Client payload hash ${payloadHash(submitPayload).slice(0, 16)}.` : submitted.error,
		citations: retrieved.map((d) => d.id).slice(0, 3),
		confidence: planned?.confidence ?? .5,
		steps,
		retrieved,
		toolTrace,
		desktop: desk,
		tokensHint: `${providerCalls.length} model calls`,
		totalMs: Date.now() - started,
		teacherModel: planRes.model,
		providerCalls,
		hodgeform: mcpMeta(mcp),
		receipts,
		route: governedRoute
	};
}
function hashesNote(steps, hash) {
	steps.push(step("orbita", "Client payload hash", `SHA-256 ${hash.slice(0, 16)}… (Core hash is authoritative)`));
}
function extractField(raw, key) {
	try {
		const start = raw.indexOf("{");
		const end = raw.lastIndexOf("}");
		if (start < 0 || end <= start) return void 0;
		const v = JSON.parse(raw.slice(start, end + 1))[key];
		return typeof v === "string" ? v : void 0;
	} catch {
		return;
	}
}
function listCorpusHandler() {
	return CORPUS.map((d) => ({
		id: d.id,
		title: d.title,
		tags: d.tags,
		excerpt: d.text.slice(0, 180)
	}));
}
//#endregion
export { executeRun, getInfrastructureHandler, getSystemStatusHandler, listCorpusHandler };
