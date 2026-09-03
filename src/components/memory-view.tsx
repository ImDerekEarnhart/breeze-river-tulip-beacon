import { useMemo, useState } from "react";
import { useLab } from "@/lib/store";
import { CORPUS } from "@/lib/agent/corpus";
import { formatDate } from "@/lib/utils";
import type { MemoryKind } from "@/lib/agent/types";
import { MemoryWalkthrough } from "@/components/memory-walkthrough";
import { WorldPlane } from "@/components/world-plane";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const KINDS: { id: MemoryKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "working", label: "Working" },
  { id: "semantic", label: "Semantic" },
  { id: "episodic", label: "Episodic" },
  { id: "procedural", label: "Procedural" },
  { id: "experimental", label: "Experimental" },
  { id: "training", label: "Training" },
];

export function MemoryView() {
  const memories = useLab((s) => s.memories);
  const turns = useLab((s) => s.turns);
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("all");

  const working = useMemo(
    () =>
      turns.slice(-4).map((t) => ({
        id: t.id,
        kind: "working" as const,
        title: t.role === "user" ? "User" : "Agent",
        body: t.content.slice(0, 240),
        createdAt: 0,
      })),
    [turns],
  );

  const semantic = CORPUS.map((d) => ({
    id: d.id,
    kind: "semantic" as const,
    title: d.title,
    body: d.text.slice(0, 220),
    createdAt: 0,
  }));

  const all = [...working, ...memories, ...semantic];
  const filtered = kind === "all" ? all : all.filter((m) => m.kind === kind);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
        State
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">
        Memory is not the prompt.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        The world and the chat persist together. There is no clear. Reload
        keeps the same thread. Drawers and the eight world planes stay. The
        bouncer is still not wired as a write gate.
      </p>

      <div className="mt-8">
        <WorldPlane />
      </div>

      <MemoryWalkthrough />

      <div className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl tracking-tight">Drawers</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          live preview notes
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={cn(
              "h-11 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em]",
              kind === k.id
                ? "border-fg/30 bg-bg-subtle text-fg"
                : "border-border text-muted",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid gap-3 pb-10 md:grid-cols-2">
        {filtered.map((m) => (
          <li
            key={`${m.kind}-${m.id}`}
            className="rounded-[var(--radius-md)] border border-border bg-bg-elevated p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge>{m.kind}</Badge>
              {m.createdAt > 0 && (
                <span className="font-mono text-[10px] text-subtle">
                  {formatDate(m.createdAt)}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-sm text-fg">{m.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{m.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}