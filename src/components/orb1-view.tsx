import { useMemo, useState } from "react";
import { admitOperator, ORB1_OPERATORS } from "@/lib/agent/orb1/admit";
import { frac } from "@/lib/agent/orb1/frac";
import { gq, isQiUnitCircle } from "@/lib/agent/orb1/gaussian";
import { pageFrac, PAGE_LIMIT } from "@/lib/agent/orb1/page";
import { runStepZero } from "@/lib/agent/orb1/ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  coordinate_derivation: "D · coordinate",
  exact_translation: "T · exact shift",
  rational_directional_derivation: "D_v · rational",
  physical_derivative_sqrt2: "√2 derivative",
  shift_pi_over_4: "π/4 shift",
};

export function Orb1View() {
  const [operatorId, setOperatorId] = useState<(typeof ORB1_OPERATORS)[number]>("coordinate_derivation");
  const [ring, setRing] = useState<ReturnType<typeof runStepZero> | null>(null);
  const [paging, setPaging] = useState<"ok" | "overflow">("ok");
  const decision = useMemo(() => admitOperator(operatorId), [operatorId]);
  const page = paging === "ok" ? pageFrac(frac(1, 2)) : pageFrac(frac(PAGE_LIMIT, 1n));
  const units = [
    { label: "1", z: gq(1, 0) },
    { label: "i", z: gq(0, 1) },
    { label: "3/5+4/5 i", z: gq(frac(3, 5), frac(4, 5)) },
    { label: "(1+i)/√2", z: null as null },
  ];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">ORB-1 admission</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Exact arithmetic on Q(i)[Z^d]. Operators are admitted or quarantined by
            the coefficient ring. This is not Hodgeform Core, not LANGUAGE_LIMIT,
            and never EARNED.
          </p>
        </div>
        <Badge tone={decision.decision === "ADMIT" ? "ok" : "warn"}>{decision.decision}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {ORB1_OPERATORS.map((id) => {
          const row = admitOperator(id);
          const on = id === operatorId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOperatorId(id)}
              className={cn(
                "h-11 min-w-11 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
                on
                  ? "border-fg/30 bg-bg-subtle text-fg"
                  : "border-border text-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {LABELS[id] ?? id}
              <span className="ml-2 text-subtle">{row.decision === "ADMIT" ? "A" : "Q"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              {decision.family}
            </span>
            <Badge tone={decision.inQi ? "ok" : "warn"}>{decision.inQi ? "in Q(i)" : "not in Q(i)"}</Badge>
            <Badge tone="default">coreLanguageLimit=false</Badge>
            <Badge tone="default">earned=false</Badge>
          </div>
          <h3 className="mt-3 text-lg text-fg">{decision.operatorId}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{decision.reason}</p>
          {decision.multiplierNeeded && (
            <p className="mt-3 font-mono text-[11px] text-fg">needs {decision.multiplierNeeded}</p>
          )}
          {decision.phasorNeeded && (
            <p className="mt-3 font-mono text-[11px] text-fg">needs {decision.phasorNeeded}</p>
          )}
          {decision.translationParameterDomain && (
            <p className="mt-3 text-xs leading-relaxed text-muted">{decision.translationParameterDomain}</p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-subtle">
            Scope: {decision.scopeClaim}. Ring {decision.ring}.
          </p>
        </article>

        <div className="space-y-4">
          <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              Q(i) unit circle
            </div>
            <ul className="mt-3 space-y-2 font-mono text-[11px]">
              {units.map((u) => (
                <li key={u.label} className="flex justify-between gap-3">
                  <span className="text-fg">{u.label}</span>
                  <span className="text-muted">
                    {u.z ? (isQiUnitCircle(u.z) ? "admitted phasor" : "not unit") : "not in Q(i)"}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              16-bit paging · simulation
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Overflow if |n| or |d| ≥ 2^15. Not a register machine. Not the Tower VM.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                variant={paging === "ok" ? "default" : "outline"}
                onClick={() => setPaging("ok")}
              >
                1/2
              </Button>
              <Button
                type="button"
                size="lg"
                variant={paging === "overflow" ? "default" : "outline"}
                onClick={() => setPaging("overflow")}
              >
                32768
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={page.status === "OK" ? "ok" : "fail"}>{page.status}</Badge>
              <span className="font-mono text-[11px] text-muted">{page.label}</span>
            </div>
          </article>
        </div>
      </div>

      <article className="mt-6 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Exact ring laws
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              80 mulberry32 cases plus seed-free regressions cos(t)sin(2t) and cos²(t).
              Not Python random.Random.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => setRing(runStepZero({ n: 80, d: 2, seed: 20260819 }))}
          >
            Run exact check
          </Button>
        </div>
        {ring ? (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ring.verdict.startsWith("SURVIVED") ? "ok" : "fail"}>{ring.verdict}</Badge>
              <span className="font-mono text-[11px] text-muted">
                failures {ring.failureCount} · exact {String(ring.exactArithmetic)} · tolerance{" "}
                {String(ring.toleranceUsed)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-subtle">{ring.note}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Not run yet. The ring is idle until you ask.</p>
        )}
      </article>
    </div>
  );
}
