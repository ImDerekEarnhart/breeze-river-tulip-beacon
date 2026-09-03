import { useMemo, useState } from "react";
import { diagnoseSuite, diagnoseWorld } from "@/lib/agent/tower/fibers";
import { LOCAL_FIBER_WORLDS } from "@/lib/agent/tower/worlds";
import { localLanguageSnapshot, snapshotCanonical } from "@/lib/agent/tower/snapshot";
import {
  CoreLanguageAdapters,
  GovernedPipeline,
  SuperintelligenceStages,
} from "@/components/governed-pipeline";
import { Orb1View } from "@/components/orb1-view";
import { FlmView } from "@/components/flm-view";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SUITE = diagnoseSuite(LOCAL_FIBER_WORLDS);

const TABS = [
  { id: "fiber", label: "Fiber" },
  { id: "orb1", label: "ORB-1" },
  { id: "flm", label: "FLM" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TowerView() {
  const [tab, setTab] = useState<TabId>("fiber");
  const [worldId, setWorldId] = useState(LOCAL_FIBER_WORLDS[0]?.id ?? "SUM-GT");
  const world = LOCAL_FIBER_WORLDS.find((w) => w.id === worldId) ?? LOCAL_FIBER_WORLDS[0];
  const audit = useMemo(() => (world ? diagnoseWorld(world) : null), [world]);
  const snapshot = localLanguageSnapshot();
  const canonical = snapshotCanonical();

  if (!world || !audit) return null;

  return (
    <div className="min-w-0 px-4 py-6 md:px-8 md:py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
        Language Tower
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
        Current executable L_t
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Orbita is the epistemic governor. The Tower is the semantic substrate. This
        page is a finite fiber-collision control, a local Q(i) admission gate, and a
        Fiber Lattice Machine kernel — not the Tower VM, not a Core LANGUAGE_LIMIT
        certificate, and not Opaque Fiber v1.0.1.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Callout
          label="Local suite"
          value={`${SUITE.audits.filter((a) => a.matchesExpected).length}/${SUITE.audits.length} exact`}
          note="Designer-supplied worlds. Not the sealed 18-world benchmark."
        />
        <Callout
          label="LANGUAGE_LIMIT issued"
          value="false"
          note="A table search is not a grammar-wide theorem."
        />
        <Callout
          label="Promotion"
          value="disabled"
          note="The Tower may propose L_t+1. It may not promote it."
        />
      </div>

      <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Governed pipeline</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Self-improvement is evidence-gated language repair. Origin is not evidence.
          </p>
          <div className="mt-5">
            <GovernedPipeline activeId="auditor" />
          </div>
        </div>
        <div className="space-y-5">
          <CoreLanguageAdapters />
          <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              First principle
            </div>
            <p className="mt-2 text-sm leading-relaxed text-fg">
              Self-improvement is not self-editing. A finite miss is SEARCH_FAILURE. A
              language limit is a theorem on a frozen grammar. Exhausted search is not
              a theorem.
            </p>
          </article>
        </div>
      </section>

      <div className="mt-12 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "h-11 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
              tab === t.id
                ? "border-fg/30 bg-bg-subtle text-fg"
                : "border-border text-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "flm" ? (
        <section className="mt-8 min-w-0">
          <FlmView />
        </section>
      ) : tab === "orb1" ? (
        <section className="mt-8 min-w-0">
          <Orb1View />
        </section>
      ) : (

      <section className="mt-8 min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Fiber auditor</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              O factors through π iff O is constant on every fiber of π. Recovery uses
              only independent candidates. Target-derived and π-derived channels cannot
              count as new information.
            </p>
          </div>
          <Badge tone={SUITE.falseHoles === 0 && SUITE.missedHoles === 0 ? "ok" : "fail"}>
            {SUITE.falseHoles} false holes · {SUITE.missedHoles} missed
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {LOCAL_FIBER_WORLDS.map((w) => {
            const row = SUITE.audits.find((a) => a.worldId === w.id);
            const on = w.id === worldId;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setWorldId(w.id)}
                className={cn(
                  "h-11 min-w-11 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
                  on
                    ? "border-fg/30 bg-bg-subtle text-fg"
                    : "border-border text-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {w.id}
                <span className="ml-2 text-subtle">
                  {row?.status === "HOLE" ? "H" : "N"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                {world.domain}
              </span>
              <Badge tone={audit.status === "HOLE" ? "warn" : "ok"}>{audit.status}</Badge>
              <Badge tone={audit.matchesExpected ? "ok" : "fail"}>
                {audit.matchesExpected ? "matches expected" : "mismatch"}
              </Badge>
            </div>
            <h3 className="mt-3 text-lg text-fg">{world.name}</h3>
            <p className="mt-1 text-sm text-muted">{world.adversarialRole}</p>

            <div className="mt-4 max-w-full overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="text-subtle">
                    <th className="py-2 pr-3 font-medium">state</th>
                    {featureKeys(world).map((k) => (
                      <th key={k} className="py-2 pr-3 font-medium">
                        {k}
                        {world.piKeys.includes(k) ? " · π" : ""}
                        {world.oKey === k ? " · O" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {world.states.map((s) => (
                    <tr key={s.id} className="border-t border-border text-fg">
                      <td className="py-2 pr-3">{s.id}</td>
                      {featureKeys(world).map((k) => (
                        <td key={k} className="py-2 pr-3">
                          {String(s.features[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                π fibers
              </div>
              <ul className="mt-2 space-y-2">
                {audit.fibers.map((f) => (
                  <li
                    key={f.key}
                    className={cn(
                      "rounded-[var(--radius-md)] border px-3 py-2 text-sm",
                      f.collision
                        ? "border-warn/40 bg-warn/10 text-fg"
                        : "border-border text-muted",
                    )}
                  >
                    <span className="font-mono text-[11px] text-fg">{f.key || "∅"}</span>
                    <span className="ml-2 text-xs">
                      {f.stateIds.join(", ")} · O = {f.oValues.map(String).join(" | ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                Collision witnesses
              </div>
              {audit.witnesses.length === 0 ? (
                <p className="mt-2 text-sm text-muted">None. Target is constant on every fiber.</p>
              ) : (
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-fg">
                  {audit.witnesses.map((w) => (
                    <li key={`${w.x}-${w.y}`}>
                      {w.x} ~ {w.y} on π · O differs
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                Overseparation
              </div>
              {audit.overseparations.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No nuisance split on this table.</p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted">
                    Same O, different π. Repair would be compression, not expansion. Not
                    applied here.
                  </p>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-fg">
                    {audit.overseparations.slice(0, 6).map((w) => (
                      <li key={`${w.x}-${w.y}`}>
                        {w.x} / {w.y}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>

            <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                Provenance-safe recovery
              </div>
              <dl className="mt-2 space-y-1 font-mono text-[11px]">
                {world.candidates.map((c) => (
                  <div key={c.id} className="flex justify-between gap-3">
                    <dt className="text-fg">
                      {c.id} · {c.label}
                    </dt>
                    <dd className="text-muted">{c.provenance}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 text-sm text-fg">
                {audit.admittedRecoverySets.length === 0
                  ? "No admissible independent recovery."
                  : audit.admittedRecoverySets.map((set) => set.join("+")).join(" ; ")}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Scope: {audit.scopeClaim}. languageLimitIssued={String(audit.languageLimitIssued)}.
                searchFailureIssued={String(audit.searchFailureIssued)}.
              </p>
            </article>
          </div>
        </div>
      </section>
      )}

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Language snapshot
          </div>
          <h3 className="mt-2 text-lg text-fg">
            {snapshot.language_id} · {snapshot.version}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {snapshot.machine.kind}. not_the_tower_vm={String(snapshot.machine.not_the_tower_vm)}.
            promotion_enabled={String(snapshot.promotion_enabled)}.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {snapshot.primitive_registry.map((p) => (
              <li key={p.symbol} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-[11px] text-fg">{p.symbol}</span>
                <span className="text-muted">{p.grounding_status}</span>
                <span className="text-subtle">{p.admission}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              Ignorance queue
            </div>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              {snapshot.ignorance_queue.map((g) => (
                <li key={g.gap_id}>
                  <span className="text-fg">{g.kind}</span> — {g.note}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-subtle">
            Canonical length {canonical.length}. Local digest is not a Hodgeform Core hash.
          </p>
        </article>

        <div>
          <h2 className="font-display text-2xl tracking-tight">Stages A–I</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Progress is a milestone, not a benchmark score. Stage I is refused.
          </p>
          <div className="mt-4">
            <SuperintelligenceStages />
          </div>
        </div>
      </section>

      <p className="mt-10 pb-8 max-w-2xl text-sm leading-relaxed text-muted">
        The Tower may discover that it needs to change. It may not decide by itself
        that the change is now true.
      </p>
    </div>
  );
}

function Callout({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
        {label}
      </div>
      <div className="mt-2 text-lg text-fg">{value}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
    </div>
  );
}

function featureKeys(world: (typeof LOCAL_FIBER_WORLDS)[number]): string[] {
  const keys: string[] = [];
  for (const s of world.states) {
    for (const k of Object.keys(s.features)) {
      if (!keys.includes(k)) keys.push(k);
    }
  }
  return keys;
}
