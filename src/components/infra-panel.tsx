import { useEffect, useState } from "react";
import { getInfrastructure, runSyntheticHodgeformCase } from "@/lib/agent/api";
import { CORE_PROOF } from "@/lib/agent/core-proof";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Role = {
  configured: boolean;
  provider: string;
  baseHost: string;
  healthHost?: string;
  modelIdConfigured: string;
  modelRevision?: string;
  failClosed: boolean;
};

type Condition = {
  id: string;
  ready: boolean;
  blocked: boolean;
  reason: string;
};

type Infra = {
  student: string;
  teacher: string;
  retrieval: string;
  desktop: string;
  orbita: string;
  providers?: { student: Role; teacher: Role };
  studentHealth?: {
    configured: boolean;
    ok: boolean;
    host: string;
    models: string[];
    error?: string;
  };
  uiHealth?: {
    ok: boolean;
    host: string;
    service?: string;
    version?: string;
    error?: string;
  };
  mcp?: {
    host: string;
    status: string;
    auth: string;
    authMode?: string;
    connected: boolean;
    tools: string[];
    error?: string;
  };
  desktopSimulated?: boolean;
  proof?: {
    appMcpReady: boolean;
    operatorChatChannel: string;
    notFromAppMcp: boolean;
    caseId: string;
    loopId: string;
    loopValid: boolean;
    protocolLoopId: string;
    protocolValid: boolean;
    coreProduct: string;
    coreVersion: string;
  };
  benchmark?: {
    executed: boolean;
    ready: boolean;
    protocolLoopId: string;
    equalBudget: { maxOutputTokens: number; timeoutSeconds: number; nTasks: number };
    conditions: Condition[];
  };
};

type ProofRun = {
  ok: boolean;
  error?: string;
  steps: { tool: string; ok: boolean; detail: string }[];
  ids: Record<string, string>;
};

export function InfraPanel() {
  const [infra, setInfra] = useState<Infra | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [proof, setProof] = useState<ProofRun | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getInfrastructure().then((row) => {
      if (!cancelled) setInfra(row as Infra);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runProof() {
    if (proofBusy) return;
    setProofBusy(true);
    try {
      const row = (await runSyntheticHodgeformCase()) as ProofRun;
      setProof(row);
    } catch (e) {
      setProof({
        ok: false,
        error: e instanceof Error ? e.message : "Proof failed",
        steps: [],
        ids: {},
      });
    } finally {
      setProofBusy(false);
    }
  }

  if (!infra) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted">Checking live providers…</p>
        <ReceiptCard />
      </div>
    );
  }

  const mcpTone =
    infra.mcp?.connected ? "ok" : infra.mcp?.status === "auth_required" ? "warn" : "fail";
  const studentOk = Boolean(infra.providers?.student.configured && infra.studentHealth?.ok);

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
        Runtime (honest)
      </div>
      <ul className="space-y-2 text-xs leading-relaxed">
        <li className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Student GPU</span>
            <Badge tone={studentOk ? "student" : "fail"}>
              {studentOk ? "healthy" : infra.providers?.student.configured ? "down" : "unset"}
            </Badge>
          </div>
          <p className="mt-1 text-fg">{infra.student}</p>
          {infra.studentHealth?.error && (
            <p className="mt-1 text-muted">{infra.studentHealth.error}</p>
          )}
        </li>
        <li className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Teacher / Grok</span>
            <Badge tone={infra.providers?.teacher.configured ? "teacher" : "fail"}>
              {infra.providers?.teacher.configured ? "configured" : "missing"}
            </Badge>
          </div>
          <p className="mt-1 text-fg">{infra.teacher}</p>
        </li>
        <li className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">App MCP</span>
            <Badge tone={mcpTone}>{infra.mcp?.status ?? "unknown"}</Badge>
          </div>
          <p className="mt-1 text-fg">
            {infra.mcp?.host} · {infra.mcp?.authMode ?? infra.mcp?.auth}
          </p>
          {infra.mcp?.error && <p className="mt-1 text-muted">{infra.mcp.error}</p>}
        </li>
        <li className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Core UI liveness</span>
            <Badge tone={infra.uiHealth?.ok ? "ok" : "fail"}>
              {infra.uiHealth?.ok ? "up" : "down"}
            </Badge>
          </div>
          <p className="mt-1 text-fg">
            {infra.uiHealth?.service ?? "ui"} {infra.uiHealth?.version ?? ""} · not MCP auth
          </p>
        </li>
        <li className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Desktop</span>
            <Badge tone="warn">simulated</Badge>
          </div>
          <p className="mt-1 text-fg">{infra.desktop}</p>
        </li>
      </ul>

      <ReceiptCard />

      <div className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          App MCP proof
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          tools/list → synthetic case → freeze/verify. Fails closed without server OAuth.
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2 h-11 w-full"
          disabled={proofBusy}
          onClick={() => void runProof()}
        >
          {proofBusy ? "Probing Core…" : "Run non-prod proof"}
        </Button>
        {proof && (
          <p className={`mt-2 text-xs ${proof.ok ? "text-fg" : "text-muted"}`}>
            {proof.ok
              ? `Core accepted · ${proof.ids.case_id ?? "case"} ${proof.ids.loop_id ?? ""}`
              : proof.error ?? "Proof failed closed"}
          </p>
        )}
      </div>

      {infra.benchmark && (
        <div className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Equal-budget comparison
            </span>
            <Badge tone={infra.benchmark.ready ? "ok" : "warn"}>
              {infra.benchmark.executed ? "ran" : "blocked"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted">
            {infra.benchmark.equalBudget.maxOutputTokens} tokens ·{" "}
            {infra.benchmark.equalBudget.timeoutSeconds}s · {infra.benchmark.equalBudget.nTasks}{" "}
            tasks. Not an official ARC score.
          </p>
          <ul className="mt-2 space-y-1">
            {infra.benchmark.conditions.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2">
                <span className="text-xs text-fg">{labelFor(c.id)}</span>
                <Badge tone={c.ready ? "ok" : "fail"}>{c.ready ? "ready" : "blocked"}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Comparison waits until GPU student health and tenant server OAuth exist. Grok is not
            the student.
          </p>
        </div>
      )}

      <p className="text-muted">{infra.retrieval}</p>
    </div>
  );
}

function ReceiptCard() {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
        Core receipts
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Operator chat channel, not this app's MCP client. {CORE_PROOF.product} {CORE_PROOF.version}.
      </p>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-fg">
        case {CORE_PROOF.syntheticCase.id}
        <br />
        loop {CORE_PROOF.syntheticLoop.id} · {CORE_PROOF.syntheticLoop.valid ? "valid" : "unverified"}
        <br />
        protocol {CORE_PROOF.protocolLoop.id} · {CORE_PROOF.protocolLoop.valid ? "valid" : "unverified"}
      </p>
    </div>
  );
}

function labelFor(id: string) {
  if (id === "grok_alone") return "Grok alone";
  if (id === "vllm_student") return "vLLM student";
  if (id === "grok_vllm_hodgeform") return "Grok/vLLM + Hodgeform";
  return id;
}
