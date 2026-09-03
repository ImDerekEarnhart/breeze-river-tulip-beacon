import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLab } from "@/lib/store";
import { hashPreview } from "@/lib/utils";
import { CORE_PROOF } from "@/lib/agent/core-proof";
import { CORE_LANGUAGE_ADAPTERS } from "@/lib/agent/tower/pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OrbitaView() {
  const experiments = useLab((s) => s.experiments);
  const [openId, setOpenId] = useState<string | null>(experiments[0]?.caseId ?? null);
  const open = experiments.find((e) => e.caseId === openId) ?? experiments[0];

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] md:min-h-dvh md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="border-b border-border px-4 py-6 md:border-b-0 md:border-r md:px-6 md:py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
          HodgeForm
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Frozen before tested.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Hodgeform Core owns freeze, approval, and receipts. This page is a Guided
          view. Governed runs fail closed until the orchestrator has tenant MCP
          OAuth — this UI does not invent a second scientific engine.
        </p>
        <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Operator-chat proof
            </span>
            <Badge tone="ok">Core {CORE_PROOF.version}</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            These hashes came from Hodgeform Core on the operator chat channel. They
            were not produced by this app's MCP client, which still lacks server OAuth.
          </p>
          <dl className="mt-3 space-y-2 font-mono text-[11px] text-fg">
            <div>
              <dt className="text-subtle">synthetic case</dt>
              <dd>{CORE_PROOF.syntheticCase.id}</dd>
            </div>
            <div>
              <dt className="text-subtle">synthetic loop</dt>
              <dd>
                {CORE_PROOF.syntheticLoop.id}
                <span className="text-muted"> · {CORE_PROOF.syntheticLoop.valid ? "valid" : "invalid"}</span>
              </dd>
            </div>
            <div>
              <dt className="text-subtle">event hash</dt>
              <dd className="break-all">{CORE_PROOF.syntheticLoop.eventHash}</dd>
            </div>
            <div>
              <dt className="text-subtle">protocol freeze</dt>
              <dd>
                {CORE_PROOF.protocolLoop.id}
                <span className="text-muted"> · {CORE_PROOF.protocolLoop.valid ? "valid" : "invalid"}</span>
              </dd>
            </div>
          </dl>
        </div>
        <ol className="mt-8 space-y-3 font-mono text-xs text-muted">
          {[
            "orbita_create_case",
            "orbita_create_general_problem_loop",
            "orbita_verify_general_problem_loop",
            "SHA-256 freeze",
            "exact-hash approval (not this UI)",
            "equal-budget comparison blocked until GPU + OAuth",
            "independent evaluation",
          ].map((row, i) => (
            <li key={row} className="flex gap-3">
              <span className="text-subtle">0{i + 1}</span>
              <span className="text-fg">{row}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              ORB-L admission
            </span>
            <Badge>Core tools</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Origin is not evidence. EARNED requires the full gate set. Guided lists
            these adapter names; it does not run them, and the Tower cannot promote
            itself.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-[11px] text-fg">
            {CORE_LANGUAGE_ADAPTERS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <Link
            to="/tower"
            className="mt-4 inline-flex h-11 items-center text-sm text-fg underline-offset-4 hover:underline"
          >
            Open fiber auditor
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted">
          Open Console, switch to Governed, and ask for an experiment. The teacher
          proposes; Core freezes. Comparison of Grok vs vLLM vs Hodgeform stays blocked
          until the student GPU and a tenant-bound server credential exist.
        </p>
      </section>

      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm text-fg">Cases</h2>
          <span className="font-mono text-[10px] text-subtle">{experiments.length} local records</span>
        </div>
        <ul className="mt-4 space-y-2">
          {experiments.map((e) => (
            <li key={e.caseId}>
              <button
                type="button"
                onClick={() => setOpenId(e.caseId)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-left hover:border-border-strong"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-subtle">{e.caseId}</span>
                  <StatusBadge status={e.status} pass={e.evaluation?.pass} />
                </div>
                <div className="mt-1 text-sm text-fg">{e.question}</div>
              </button>
            </li>
          ))}
        </ul>

        {open && (
          <article className="mt-6 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-muted">{open.caseId}</span>
              <span className="font-mono text-[11px] text-subtle">
                sha256 {hashPreview(open.planHash)}
              </span>
            </div>
            <h3 className="mt-3 text-lg text-fg">{open.question}</h3>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
              {open.plan}
            </pre>
            {open.discovery && (
              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  Discovery
                </div>
                <p className="mt-1 text-sm text-fg">{open.discovery}</p>
              </div>
            )}
            {open.evaluation && (
              <div className="mt-4 flex items-start justify-between gap-3">
                <p className="text-sm text-muted">{open.evaluation.notes}</p>
                <StatusBadge status="evaluated" pass={open.evaluation.pass} />
              </div>
            )}
            {open.status === "frozen" && (
              <Button
                className="mt-4"
                size="sm"
                onClick={() => useLab.getState().approveExperiment(open.caseId)}
              >
                Approve plan
              </Button>
            )}
          </article>
        )}
      </section>
    </div>
  );
}

function StatusBadge({
  status,
  pass,
}: {
  status: string;
  pass?: boolean;
}) {
  if (status === "evaluated") {
    return <Badge tone={pass ? "ok" : "fail"}>{pass ? "pass" : "fail"}</Badge>;
  }
  if (status === "frozen") return <Badge tone="warn">frozen</Badge>;
  if (status === "approved") return <Badge tone="live">approved</Badge>;
  return <Badge>{status}</Badge>;
}
