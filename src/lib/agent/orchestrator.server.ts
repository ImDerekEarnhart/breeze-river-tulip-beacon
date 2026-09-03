import { retrieve, corpusStats } from "./retrieval.ts";
import { executeTool, TOOL_SCHEMAS } from "./tools";
import {
  studentChat,
  teacherChat,
  studentAvailable,
  studentProvider,
  teacherProvider,
  providerPublicStatus,
} from "./providers/index.server";
import type { ChatResult } from "./providers/types";
import { mcpConfig } from "./providers/config.server";
import { probeStudentHealth, probeHodgeformUiHealth } from "./providers/health.server";
import { probeMcp, callMcpTool, guidedPlanPayload, payloadHash } from "./hodgeform/mcp.server";
import { EQUAL_BUDGET } from "./hodgeform/protocol";
import { CORE_PROOF } from "./core-proof";
import { CORPUS } from "./corpus";
import { initialDesktop, type DeskSnapshot } from "../desktop";
import { emitReceipt, emitProposal, hashText } from "./receipts.server";
import { admitOperator } from "./orb1/admit";
import { POLICY_VERSION, RETRIEVE_PROVENANCE, RETRIEVE_STEP_TITLE, TEACHER_ROUTE_EVENT, routeAfterVerify, routeWhenStudentMissing } from "./roles.ts";
import { admitTeacherCorrection, matchSmokeItem, scoreAnswer } from "./education/index.ts";
import type { ReceiptEnvelope } from "./receipts";
import type {
  AgentDecision,
  AgentMode,
  MemoryItem,
  RetrievedDoc,
  RouteDecision,
  RunStep,
  RunTrace,
  ToolCall,
  ToolName,
  ToolResult,
  TrainingRecord,
  ProviderCall,
  HodgeformMeta,
} from "./types";

function step(
  kind: RunStep["kind"],
  title: string,
  detail: string,
  extra?: Partial<RunStep>,
): RunStep {
  return {
    id: crypto.randomUUID().slice(0, 8),
    kind,
    title,
    detail,
    latencyMs: extra?.latencyMs ?? 0,
    model: extra?.model,
    data: extra?.data,
  };
}



function noteCall(calls: ProviderCall[], role: "student" | "teacher", res: ChatResult): ProviderCall {
  const row: ProviderCall = {
    role,
    provider: res.provider,
    model: res.model,
    ok: res.ok,
    latencyMs: res.latencyMs,
  };
  calls.push(row);
  return row;
}

function failTrace(opts: {
  id: string;
  started: number;
  request: string;
  mode: AgentMode;
  retrieved: RetrievedDoc[];
  steps: RunStep[];
  toolTrace: ToolResult[];
  desk: DeskSnapshot;
  message: string;
  providerCalls?: ProviderCall[];
  hodgeform?: HodgeformMeta;
  receipts?: ReceiptEnvelope[];
  route?: RouteDecision;
}): RunTrace {
  const receipts = opts.receipts ?? [];
  emitReceipt(receipts, {
    id: crypto.randomUUID(),
    kind: "control",
    runId: opts.id,
    producer: "guided-orchestrator",
    createdAt: Date.now(),
    provenance: ["fail-closed"],
    payload: { type: "control", event: "fail_closed", message: opts.message },
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
      policyVersion: POLICY_VERSION,
    },
  };
}

function mcpMeta(probe: Awaited<ReturnType<typeof probeMcp>>): HodgeformMeta {
  return {
    connected: probe.ok,
    status: probe.status,
    host: probe.urlHost,
    tools: probe.tools.map((t) => t.name),
    error: probe.error,
    authMode: probe.authMode,
  };
}

function parseDecision(raw: string): AgentDecision | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    const action =
      obj.action === "tool" || obj.action === "escalate" || obj.action === "answer"
        ? obj.action
        : "answer";
    const toolRaw = obj.tool as { name?: string; arguments?: Record<string, unknown> } | undefined;
    let tool: ToolCall | undefined;
    if (toolRaw?.name) {
      const args: Record<string, string> = {};
      if (toolRaw.arguments && typeof toolRaw.arguments === "object") {
        for (const [k, v] of Object.entries(toolRaw.arguments)) {
          args[k] = typeof v === "string" ? v : JSON.stringify(v);
        }
      }
      tool = { name: toolRaw.name as ToolName, arguments: args };
    }
    return {
      thought: String(obj.thought ?? ""),
      confidence: Math.max(0, Math.min(1, Number(obj.confidence ?? 0.5))),
      action,
      tool,
      answer: obj.answer ? String(obj.answer) : undefined,
      citations: Array.isArray(obj.citations)
        ? obj.citations.map((c) => String(c))
        : undefined,
    };
  } catch {
    return null;
  }
}

const STUDENT_SYS = `You are the Guided worker role in Hodgeform. You are a replaceable reasoning provider, not Hodgeform Core and not a desktop agent.
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

const TEACHER_SYS = `You are the optional teacher role in Hodgeform Guided — a replaceable stronger provider, not Hodgeform Core.
Do not auto-approve, mutate frozen artifacts, or broaden claim scope.
Respond ONLY as JSON with keys thought, confidence, action, answer, citations, and optionally plan, discovery, evaluation_pass, evaluation_notes.
If asked to propose a governed plan, put the full plan in "plan" with Hypothesis, Method, Success, Falsification, Sandbox steps. The plan is a proposal until Hodgeform Core freezes it.
Be precise. Prefer falsifiable statements.`;

function docsBlock(docs: RetrievedDoc[]) {
  if (!docs.length) return "No retrieved passages.";
  return docs
    .map(
      (d) =>
        `[${d.id}] ${d.title} (score ${d.score.toFixed(2)})\n${d.text.slice(0, 700)}`,
    )
    .join("\n\n");
}

function verify(request: string, decision: AgentDecision, tools: ToolResult[]) {
  const item = matchSmokeItem(request);
  if (item) {
    const scored = scoreAnswer(decision.answer ?? "", item, decision.confidence);
    return {
      pass: scored.pass,
      reason: `${scored.reason} · education/${item.id}`,
    };
  }
  if (!decision.answer || decision.answer.trim().length < 8) {
    return { pass: false, reason: "Empty or too-short answer" };
  }
  if (decision.confidence < 0.55) {
    return { pass: false, reason: `Confidence ${decision.confidence.toFixed(2)} below threshold` };
  }
  if (/sandbox|calculat|compound|\d+\s*%/.test(request) && !tools.some((t) => t.name === "sandbox" && t.ok)) {
    if (/\b\d+\b/.test(decision.answer) && decision.confidence >= 0.8) {
      return { pass: true, reason: "Numeric answer with high confidence" };
    }
  }
  return { pass: true, reason: "Answer present and confidence above threshold · shallow (VERIFIER_LIMIT)" };
}

function seedMemory(): MemoryItem[] {
  return [
    {
      id: "proc-sandbox",
      kind: "procedural",
      title: "Sandbox policy",
      body: "Only sandbox, retrieve, memory, orbita_status, fiber_diagnose, orb1_admit, flm_audit. No shell. Destroy worker after result.",

      createdAt: Date.now() - 86400000,
    },
    {
      id: "proc-escalate",
      kind: "procedural",
      title: "Escalation rules",
      body: "Escalate when confidence < 0.55, governed research, or verification fails. Escalation is an explicit teacher route with a reason. A missing student is fail-closed, not a teacher fallback.",

      createdAt: Date.now() - 86400000,
    },
  ];
}

export function getSystemStatusHandler() {
  const stats = corpusStats();
  const s = studentProvider().config;
  const t = teacherProvider().config;
  return {
    ai: s.configured,
    student: s.configured
      ? `${s.modelId}${s.modelRevision ? `@${s.modelRevision}` : ""} @ ${s.baseHost} · role student`
      : "not configured — set STUDENT_BASE_URL, STUDENT_MODEL_ID, STUDENT_HEALTH_URL",
    teacher: t.configured
      ? `${t.modelId} @ ${t.baseHost} · role teacher`
      : "not configured",
    retrieval: `local lexical BM25 · ${stats.documents} docs · not the Language Tower`,

    sandbox: "policy engine · isolated python",
    orbita: "Hodgeform Core via MCP · fail-closed without server OAuth",
    desktop: "SIMULATED canvas · not a cloud VM",
  };
}

export async function getInfrastructureHandler() {
  const cfg = mcpConfig();
  const [mcp, studentHealth, uiHealth] = await Promise.all([
    probeMcp(),
    probeStudentHealth(),
    probeHodgeformUiHealth(cfg.uiHealthUrl),
  ]);
  const providers = providerPublicStatus();
  const studentReady =
    providers.student.configured && studentHealth.ok && Boolean(providers.student.modelIdConfigured);
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
      error: studentHealth.error,
    },
    uiHealth: {
      ok: uiHealth.ok,
      host: uiHealth.host,
      service: uiHealth.service,
      version: uiHealth.version,
      latencyMs: uiHealth.latencyMs,
      error: uiHealth.error,
    },
    mcp: {
      host: mcp.urlHost,
      status: mcp.status,
      auth: mcp.auth,
      authMode: mcp.authMode,
      connected: mcp.ok,
      tools: mcp.tools.map((x) => x.name),
      error: mcp.error,
      latencyMs: mcp.latencyMs,
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
      coreVersion: CORE_PROOF.version,
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
          reason: teacherReady
            ? "Teacher/xAI is configured. Comparison still waits for student GPU + Core OAuth."
            : "Teacher/xAI is not configured.",
        },
        {
          id: "vllm_student",
          ready: studentReady,
          blocked: !studentReady,
          reason: studentReady
            ? "Student GPU health is live."
            : "Set STUDENT_BASE_URL, STUDENT_MODEL_ID, and a live STUDENT_HEALTH_URL. Grok is not the student.",
        },
        {
          id: "grok_vllm_hodgeform",
          ready: studentReady && mcpReady,
          blocked: !(studentReady && mcpReady),
          reason:
            studentReady && mcpReady
              ? "Student GPU and tenant server OAuth are live."
              : "Needs live student GPU and a tenant-bound server credential. Browser tokens are refused.",
        },
      ],
    },
  };
}

export async function executeRun(data: {
  request: string;
  mode: AgentMode;
  history: { role: string; content: string }[];
  desktop?: DeskSnapshot;
}): Promise<RunTrace> {
    const started = Date.now();
    const steps: RunStep[] = [];
    const toolTrace: ToolResult[] = [];
    const memory = seedMemory();
    let desk = data.desktop ?? initialDesktop();
    const id = crypto.randomUUID();
    const providerCalls: ProviderCall[] = [];
    const receipts: ReceiptEnvelope[] = [];

    const t0 = Date.now();
    const retrieved = retrieve(data.request, 5);
    steps.push(
      step("retrieve", RETRIEVE_STEP_TITLE, `Top ${retrieved.length} passages after BM25 + rerank`, {
        latencyMs: Date.now() - t0,
        data: {
          ids: retrieved.map((d) => d.id),
          titles: retrieved.map((d) => d.title),
        },
      }),
    );
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
        backend: "bm25-rerank",
      },
    });

    if (data.mode === "governed") {
      return runGoverned({
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
        receipts,
      });
    }

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
        message:
          "Student provider is not configured. Set STUDENT_BASE_URL (vLLM), STUDENT_MODEL_ID, and STUDENT_HEALTH_URL. Refusing to pretend Grok is the student.",
        providerCalls,
        receipts,
        route,
      });
    }

    steps.push(
      step("route", "Model router", "Student first · teacher only as explicit escalation", {
        data: { choice: "student" },
      }),
    );

    const historyMsgs = data.history.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }));

    const baseMsgs = [
      { role: "system" as const, content: STUDENT_SYS },
      ...historyMsgs,
      {
        role: "user" as const,
        content: `Runtime: role=student configured_model=${studentProvider().config.modelId} host=${studentProvider().config.baseHost}\nRequest:\n${data.request}\n\nRetrieved context:\n${docsBlock(retrieved)}`,
      },
    ];

    let apiCalls = 0;
    let raw = await studentChat(baseMsgs);
    apiCalls += 1;
    noteCall(providerCalls, "student", raw);
    if (!raw.ok) {
      return failTrace({
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
          policyVersion: POLICY_VERSION,
        },
      });
    }

    let parseFailed = false;
    let decision = parseDecision(raw.text);
    if (!decision) {
      parseFailed = true;
      decision = {
        thought: "Could not parse structured output",
        confidence: 0.2,
        action: "escalate",
        answer: raw.text.slice(0, 1200),
      };
    }

    steps.push(
      step("reason", "Student reason", `${decision.thought || "Structured action"} · model ${raw.model}`, {
        model: "student",
        data: { action: decision.action, confidence: decision.confidence, modelId: raw.model, provider: raw.provider },
      }),
    );
    emitProposal(receipts, {
      id: crypto.randomUUID(),
      runId: id,
      producer: "guided-student",
      createdAt: Date.now(),
      provenance: [`student:${raw.model}`],
      summary: decision.thought || decision.action,
      action: decision.action,
      role: "student",
    });

    let rounds = 0;
    while (decision.action === "tool" && decision.tool && rounds < 2 && apiCalls < 3) {
      const tTool = Date.now();
      const executed = await executeTool(decision.tool, memory, desk);
      desk = executed.desk;
      const result = executed.result;
      toolTrace.push(result);
      if (decision.tool.name === "memory_write") {
        memory.push({
          id: `work-${memory.length}`,
          kind: "working",
          title: decision.tool.arguments.title ?? "note",
          body: decision.tool.arguments.body ?? "",
          createdAt: Date.now(),
        });
      }
      steps.push(
        step("tool", `Sandbox / tool · ${decision.tool.name}`, result.output.slice(0, 280), {
          latencyMs: Date.now() - tTool,
          data: { ok: result.ok, name: result.name },
        }),
      );
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
          outputHash: hashText(result.output),
        },
      });
      if (result.name === "orb1_admit") {
        const op =
          decision.tool.arguments.operator ??
          decision.tool.arguments.query ??
          decision.tool.arguments.world ??
          "";
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
            earned: false,
          },
        });
      }
      raw = await studentChat([
        ...baseMsgs,
        {
          role: "assistant",
          content: JSON.stringify(decision),
        },
        {
          role: "user",
          content: `Tool ${result.name} ${result.ok ? "ok" : "failed"}:\n${result.output}\nContinue. JSON only.`,
        },
      ]);
      apiCalls += 1;
      if (!raw.ok) break;
      noteCall(providerCalls, "student", raw);
      decision = parseDecision(raw.text) ?? {
        thought: "parse fail after tool",
        confidence: 0.25,
        action: "escalate",
      };
      rounds += 1;
      steps.push(
        step("reason", "Student continue", decision.thought || decision.action, {
          model: "student",
          data: { action: decision.action, confidence: decision.confidence },
        }),
      );
    }

    if (
      decision.action !== "tool" &&
      (!decision.answer || decision.answer.trim().length < 8)
    ) {
      const lastOk = [...toolTrace].reverse().find((t) => t.ok);
      if (lastOk) {
        decision = {
          ...decision,
          action: "answer",
          answer: lastOk.output,
          confidence: Math.max(decision.confidence, 0.7),
        };
      }
    }

    const verdict = verify(data.request, decision, toolTrace);
    steps.push(
      step("verify", "Verifier", verdict.reason, {
        data: { pass: verdict.pass, confidence: decision.confidence },
      }),
    );
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
        confidence: decision.confidence,
      },
    });

    const shouldEscalate =
      decision.action === "escalate" || !verdict.pass || decision.confidence < 0.55;

    if (shouldEscalate && apiCalls < 3) {
      const route = routeAfterVerify({
        pass: verdict.pass,
        action: decision.action,
        confidence: decision.confidence,
        parseFailed,
        studentAttemptId: id,
        studentModel: raw.model,
      });
      steps.push(
        step(
          "escalate",
          "Explicit teacher route",
          `reason=${route.reason} · policy ${route.policyVersion} · not a fallback`,
          {
            model: "teacher",
            data: { choice: route.reason },
          },
        ),
      );
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
          message: `reason=${route.reason} student_attempt_id=${id} teacherSubstituted=false`,
        },
      });
      const tTeach = await teacherChat([
        { role: "system", content: TEACHER_SYS },
        {
          role: "user",
          content: `Original request:\n${data.request}\n\nRetrieved:\n${docsBlock(retrieved)}\n\nStudent attempt:\n${JSON.stringify(decision)}\n\nTool trace:\n${toolTrace.map((t) => t.name + ": " + t.output).join("\n")}\n\nVerifier: ${verdict.reason}\nTeacher route reason: ${route.reason}\nProduce the corrected final answer as JSON with action=answer.`,
        },
      ]);
      apiCalls += 1;
      noteCall(providerCalls, "teacher", tTeach);
      if (!tTeach.ok) {
        return failTrace({
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
            studentModel: raw.model,
          },
        });
      }
      const teacherDec = parseDecision(tTeach.text);
      const answer = teacherDec?.answer || tTeach.text;
      const correction = admitTeacherCorrection({
        prompt: data.request,
        teacherAnswer: answer,
        confidence: teacherDec?.confidence,
      });
      emitProposal(receipts, {
        id: crypto.randomUUID(),
        runId: id,
        producer: "guided-teacher",
        createdAt: Date.now(),
        provenance: [`teacher:${tTeach.model}`, `route:${route.reason}`],
        summary: (teacherDec?.thought || answer).slice(0, 280),
        action: "answer",
        role: "teacher",
      });
      const training: TrainingRecord = {
        id: `tr-${id.slice(0, 8)}`,
        prompt: data.request,
        studentAttempt: decision.answer || decision.thought || JSON.stringify(decision),
        teacherAnswer: answer,
        verification: correction.status,
        createdAt: Date.now(),
        status: correction.status,
        educationPass: correction.educationPass,
        educationReason: correction.reason,
        coreApproved: false,
      };
      steps.push(
        step("answer", "Teacher answer", `Supervised completion · model ${tTeach.model}`, {
          model: "teacher",
          data: { modelId: tTeach.model, provider: tTeach.provider },
        }),
      );
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
        confidence: teacherDec?.confidence ?? 0.8,
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
        route,
      };
    }

    steps.push(
      step("answer", "Student answer", `Passed verification · model ${raw.model}`, {
        model: "student",
        data: { modelId: raw.model, provider: raw.provider },
      }),
    );
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
        studentModel: raw.model,
      },
    };
}

async function runGoverned(opts: {
  id: string;
  started: number;
  request: string;
  mode: AgentMode;
  retrieved: RetrievedDoc[];
  steps: RunStep[];
  toolTrace: ToolResult[];
  memory: MemoryItem[];
  desk: DeskSnapshot;
  providerCalls: ProviderCall[];
  receipts: ReceiptEnvelope[];
}): Promise<RunTrace> {
  const { id, started, request, retrieved, steps, toolTrace, providerCalls, receipts } = opts;
  let desk = opts.desk;

  const mcp = await probeMcp();
  steps.push(
    step("orbita", "Hodgeform MCP", mcp.ok ? `Connected · ${mcp.tools.length} tools` : mcp.error ?? mcp.status, {
      data: { ok: mcp.ok },
    }),
  );
  if (!mcp.ok) {
    return failTrace({
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
        policyVersion: POLICY_VERSION,
      },
    });
  }

  const governedRoute: RouteDecision = {
    path: "teacher",
    reason: "governed_plan",
    teacherSubstituted: false,
    policyVersion: POLICY_VERSION,
  };

  steps.push(
    step("route", "Model router", "Governed path · Core owns freeze/approve; teacher only proposes", {
      data: { choice: "teacher" },
    }),
  );
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
      message: `reason=governed_plan teacherSubstituted=false`,
    },
  });

  const planRes = await teacherChat(
    [
      { role: "system", content: TEACHER_SYS },
      {
        role: "user",
        content: `Create a governed experiment/analysis plan for:\n${request}\n\nCase context:\n${docsBlock(retrieved)}\n\nJSON with thought, plan (full text), answer (brief summary of what will be tested), confidence, citations.`,
      },
    ],
    { maxTokens: 900, json: true },
  );
  noteCall(providerCalls, "teacher", planRes);
  if (!planRes.ok) {
    return failTrace({
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
        policyVersion: POLICY_VERSION,
      },
    });
  }

  const planned = parseDecision(planRes.text);
  const planText =
    extractField(planRes.text, "plan") ||
    planned?.answer ||
    planRes.text;
  emitProposal(receipts, {
    id: crypto.randomUUID(),
    runId: id,
    producer: "guided-teacher",
    createdAt: Date.now(),
    provenance: ["route:governed_plan", `teacher:${planRes.model}`],
    summary: (planned?.thought || planText).slice(0, 280),
    action: "plan",
    role: "teacher",
  });

  const names = new Set(mcp.tools.map((t) => t.name));
  const createName = [...names].find((n) => /case_create|create_case/i.test(n));
  const submitName = [...names].find((n) => /plan_submit|submit_plan|compile_plan/i.test(n));
  if (!createName || !submitName) {
    return failTrace({
      id,
      started,
      request,
      mode: opts.mode,
      retrieved,
      steps,
      toolTrace,
      desk,
      message:
        "MCP catalog is missing case-create or plan-submit. Refusing to freeze or approve in this UI.",
      providerCalls,
      hodgeform: mcpMeta(mcp),
      receipts,
      route: {
        path: "fail_closed",
        reason: "mcp_catalog_incomplete",
        teacherSubstituted: false,
        policyVersion: POLICY_VERSION,
      },
    });
  }

  const casePayload = {
    name: request.slice(0, 120) || "Guided governed case",
    goal: request,
    domain_hint: "guided orchestrator / governed proposal",
  };
  const created = await callMcpTool(createName, casePayload);
  steps.push(
    step("orbita", createName, created.ok ? "Case opened in Core" : created.error, {
      data: { ok: created.ok },
    }),
  );
  if (!created.ok) {
    return failTrace({
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
      route: governedRoute,
    });
  }

  const createdObj = created.result as { case?: { id?: string }; content?: Array<{ text?: string }> };
  const caseId =
    createdObj?.case?.id ||
    (typeof created.result === "object" && created.result && "id" in created.result
      ? String((created.result as { id?: string }).id)
      : payloadHash(casePayload).slice(0, 12));

  const submitPayload = guidedPlanPayload({
    caseId,
    summary: planned?.thought || "Guided proposal",
    coverageNotes: "Proposed by Guided teacher role; Core freeze is authoritative.",
    candidates: [
      {
        kind: "other",
        inputs: { request },
        outcome: planned?.answer || "bounded test",
        assumptions: [],
        falsifier: "Empty result, denied tool, or no supporting evidence.",
      },
    ],
  });
  hashesNote(steps, payloadHash(submitPayload));
  const submitted = await callMcpTool(submitName, { ...submitPayload, plan: planText });
  steps.push(
    step("orbita", submitName, submitted.ok ? "Plan submitted to Core" : submitted.error, {
      data: { ok: submitted.ok, planHash: payloadHash(submitPayload) },
    }),
  );

  steps.push(
    step(
      "answer",
      "Awaiting Core approval",
      "This orchestrator will not auto-approve. Exact-hash approval must happen in Hodgeform Core.",
      { model: "teacher", data: { modelId: planRes.model } },
    ),
  );

  return {
    id,
    createdAt: started,
    request,
    mode: opts.mode,
    status: submitted.ok ? "ok" : "error",
    error: submitted.ok ? undefined : submitted.error,
    escalated: true,
    modelPath: "teacher",
    answer: submitted.ok
      ? `Plan proposed and submitted to Hodgeform Core (case ${caseId}). Not approved, not executed. Teacher model ${planRes.model}. Client payload hash ${payloadHash(submitPayload).slice(0, 16)}.`
      : submitted.error,
    citations: retrieved.map((d) => d.id).slice(0, 3),
    confidence: planned?.confidence ?? 0.5,
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
    route: governedRoute,
  };
}

function hashesNote(steps: RunStep[], hash: string) {
  steps.push(
    step("orbita", "Client payload hash", `SHA-256 ${hash.slice(0, 16)}… (Core hash is authoritative)`),
  );
}

function extractField(raw: string, key: string): string | undefined {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return undefined;
    const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const v = obj[key];
    return typeof v === "string" ? v : undefined;
  } catch {
    return undefined;
  }
}

export function listCorpusHandler() {
  return CORPUS.map((d) => ({
    id: d.id,
    title: d.title,
    tags: d.tags,
    excerpt: d.text.slice(0, 180),
  }));
}
