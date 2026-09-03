import { useState } from "react";
import { runFlmScenario } from "@/lib/agent/api";
import { ReceiptChain } from "@/components/pipeline-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  { id: "refine", label: "REFINE" },
  { id: "quotient", label: "QUOTIENT" },
  { id: "route", label: "Route" },
  { id: "observe", label: "OBSERVE" },
  { id: "self_review", label: "No self-review" },
] as const;

type Demo = Awaited<ReturnType<typeof runFlmScenario>>;

export function FlmView() {
  const [id, setId] = useState<(typeof SCENARIOS)[number]["id"]>("refine");
  const [demo, setDemo] = useState<Demo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(next = id) {
    setBusy(true);
    setError(null);
    try {
      const row = await runFlmScenario({ data: { id: next } });
      setDemo(row);
    } catch (e) {
      setError(e instanceof Error ? e.message : "FLM demo failed");
    } finally {
      setBusy(false);
    }
  }

  const proposalPayload = demo?.receipts.find((r) => r.payload.type === "proposal");
  const proposal =
    proposalPayload?.payload.type === "proposal" ? proposalPayload.payload : null;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Fiber Lattice Machine</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Finite kernel v0. The world ledger is immutable. Snapshots are views.
            Candidates are hash-bound and inert until a separate admission record.
            A proposal receipt is interchange, not Hodgeform Core approval.
          </p>
        </div>
        {demo && (
          <Badge tone={demo.coreAdmission ? "fail" : "ok"}>
            coreAdmission={String(demo.coreAdmission)}
          </Badge>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => {
          const on = s.id === id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setId(s.id);
                void run(s.id);
              }}
              className={cn(
                "h-11 min-w-11 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
                on
                  ? "border-fg/30 bg-bg-subtle text-fg"
                  : "border-border text-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Button type="button" onClick={() => void run()} disabled={busy}>
          {busy ? "Running kernel…" : demo ? "Run again" : "Run exact kernel"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-fail">{error}</p>}

      {demo && (
        <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                {demo.id}
              </span>
              <Badge tone={demo.ledgerMutated ? "fail" : "ok"}>ledger frozen</Badge>
              <Badge tone="default">coreLanguageLimit=false</Badge>
              {demo.selfReviewBlocked && <Badge tone="ok">self-review blocked</Badge>}
              {proposal && (
                <Badge tone={proposal.coreApproved ? "fail" : "warn"}>
                  proposal not approved
                </Badge>
              )}
            </div>
            <h3 className="mt-3 text-lg text-fg">{demo.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{demo.body}</p>
            <dl className="mt-4 grid gap-2 text-sm">
              <Row label="Before adequate" value={fmt(demo.beforeAdequate)} />
              <Row label="After adequate" value={fmt(demo.afterAdequate)} />
              {demo.viewKeys && <Row label="Keys" value={demo.viewKeys.join(", ") || "∅"} />}
              {demo.selectedId && <Row label="Selected" value={demo.selectedId} />}
              {demo.candidateHash && (
                <Row label="Candidate" value={`${demo.candidateHash.slice(0, 16)}…`} />
              )}
            </dl>
          </article>
          <article className="min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Notes
            </div>
            <ul className="mt-3 space-y-2">
              {demo.notes.map((n) => (
                <li key={n} className="text-sm leading-relaxed text-muted">
                  {n}
                </li>
              ))}
            </ul>
            {demo.receipts.length > 0 && (
              <div className="mt-4 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Proposal receipt
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Hash-bound candidate. Not a Core freeze, not an admission.
                </p>
                <div className="mt-2">
                  <ReceiptChain receipts={demo.receipts} />
                </div>
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-subtle">
              Authority on the demo projection is labeled hodgeform only as the
              schema field. Guided did not call Core. The local hash is not a Core
              artifact hash.
            </p>
          </article>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{label}</dt>
      <dd className="min-w-0 break-all text-fg">{value}</dd>
    </div>
  );
}

function fmt(v: boolean | null) {
  if (v === null) return "n/a";
  return v ? "true" : "false";
}