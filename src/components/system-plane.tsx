import { cn } from "@/lib/utils";
import {
  ARCHITECTURE_LOOP,
  FALSIFIERS,
  NODE_COPY,
  ROLE_AXIOMS,
  type ArchNodeId,
} from "@/lib/agent/roles";
import {
  HANDOFF_ADAPTERS,
  HANDOFF_OPTIONAL,
  HANDOFF_OVERLAY,
  HANDOFF_POLICY,
  type HandoffItem,
  type HandoffStatus,
} from "@/lib/agent/handoff";
import { Badge } from "@/components/ui/badge";
import { EducationExamCard } from "@/components/education-exam";

const FAST_FLOW: { id: ArchNodeId; hint: string }[] = [
  { id: "api", hint: "request in" },
  { id: "orchestrator", hint: "route + state" },
  { id: "retrieval", hint: "context, not L_t" },
  { id: "student", hint: "via vLLM" },
  { id: "sandbox", hint: "policy then run" },
  { id: "verify", hint: "pass → answer" },
];

const GOVERN_FLOW: { id: ArchNodeId; hint: string }[] = [
  { id: "teacher", hint: "explicit reason only" },
  { id: "tower", hint: "expressive boundary" },
  { id: "orbita", hint: "freeze → falsify" },
];

function statusTone(status: HandoffStatus) {
  if (status === "live_control" || status === "live_interchange") return "ok" as const;
  if (status === "inspected_not_overwritten") return "live" as const;
  return "warn" as const;
}

function statusLabel(status: HandoffStatus) {
  if (status === "live_control") return "live control";
  if (status === "live_interchange") return "interchange";
  if (status === "inspected_not_overwritten") return "not overwritten";
  return "quarantined";
}

export function SystemPlane({
  selected,
  onSelect,
}: {
  selected: ArchNodeId | null;
  onSelect: (id: ArchNodeId) => void;
}) {
  return (
    <div className="mt-8 space-y-10 pb-8">
      <section>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-2xl tracking-tight">Fast path</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            HodgeForm stays off this loop
          </span>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FAST_FLOW.map((n, i) => (
            <FlowCard
              key={n.id}
              index={i + 1}
              id={n.id}
              hint={n.hint}
              selected={selected === n.id}
              onSelect={onSelect}
            />
          ))}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Fail or low confidence leaves this plane on an explicit teacher route. A missing
          student fail-closes. vLLM only serves the worker.
        </p>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-2xl tracking-tight">Governance plane</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            change / evaluation boundary
          </span>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-3">
          {GOVERN_FLOW.map((n, i) => (
            <FlowCard
              key={n.id}
              index={i + 1}
              id={n.id}
              hint={n.hint}
              selected={selected === n.id}
              onSelect={onSelect}
            />
          ))}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Teacher / student failure / Tower limitation → freeze → test → falsify → receipt →
          inactive candidate → human or deployment boundary. Nothing here auto-promotes.
        </p>
      </section>

      {selected && (
        <article className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-5 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            {selected}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-fg">{NODE_COPY[selected]}</p>
        </article>
      )}

      <section>
        <h2 className="font-display text-2xl tracking-tight">Executable systems handoff</h2>
        <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-subtle">
          {HANDOFF_POLICY.schema}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Restore Guided first. Diff the overlay. Do not overwrite Hodgeform adapters. Optional
          plugins stay quarantined. Receipts are not Core approval. This package is not
          standalone and does not contain Hodgeform Core.
        </p>
        <HandoffGroup title="Overlay — live" items={HANDOFF_OVERLAY} />
        <HandoffGroup title="Adapters — inspected" items={HANDOFF_ADAPTERS} />
        <HandoffGroup title="Optional — unwired" items={HANDOFF_OPTIONAL} />
      </section>

      <section>
        <h2 className="font-display text-2xl tracking-tight">Role axioms</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ROLE_AXIOMS.map((a) => (
            <li
              key={a}
              className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 font-mono text-xs text-fg"
            >
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl tracking-tight">Frozen falsifiers</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Core would not pick a diagram from prose. These tests were frozen first. Local
          status is Guided only — not a Core verdict, and not execution of that loop.
        </p>
        <ul className="mt-4 grid gap-3">
          {FALSIFIERS.map((f) => (
            <li
              key={f.id}
              className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {f.id.replaceAll("_", " ")}
                </span>
                <Badge
                  tone={
                    f.localStatus === "survives" ? "ok" : f.localStatus === "blocked" ? "warn" : "fail"
                  }
                >
                  {f.localStatus}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg">{f.claim}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{f.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <EducationExamCard />

      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        {ARCHITECTURE_LOOP.caseId} · {ARCHITECTURE_LOOP.loopId} · {ARCHITECTURE_LOOP.state} ·{" "}
        {ARCHITECTURE_LOOP.channel} · not app MCP
      </p>
    </div>
  );
}

function HandoffGroup({ title, items }: { title: string; items: readonly HandoffItem[] }) {
  return (
    <div className="mt-5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{title}</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-fg">{item.title}</span>
              <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
              <Badge tone={item.wired ? "ok" : "warn"}>{item.wired ? "wired" : "unwired"}</Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{item.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlowCard({
  index,
  id,
  hint,
  selected,
  onSelect,
}: {
  index: number;
  id: ArchNodeId;
  hint: string;
  selected: boolean;
  onSelect: (id: ArchNodeId) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(id)}
        className={cn(
          "flex min-h-11 w-full items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors duration-150",
          selected
            ? "border-fg/40 bg-bg-subtle"
            : "border-border bg-bg-elevated hover:border-border-strong",
        )}
      >
        <span className="font-mono text-[10px] text-subtle">{String(index).padStart(2, "0")}</span>
        <span>
          <span className="block text-sm text-fg">{labelOf(id)}</span>
          <span className="mt-0.5 block text-xs text-muted">{hint}</span>
        </span>
      </button>
    </li>
  );
}

function labelOf(id: ArchNodeId) {
  switch (id) {
    case "api":
      return "User / API";
    case "orchestrator":
      return "Controller";
    case "retrieval":
      return "Retrieval";
    case "student":
      return "Student";
    case "sandbox":
      return "Tool policy / sandbox";
    case "verify":
      return "Verifier";
    case "teacher":
      return "Teacher";
    case "tower":
      return "Language Tower L_t";
    case "orbita":
      return "Orbita / HodgeForm";
    default:
      return id;
  }
}
