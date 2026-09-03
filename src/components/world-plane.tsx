import type { ReactNode } from "react";
import { useWorld } from "@/lib/world-store";
import { Badge } from "@/components/ui/badge";

export function WorldPlane({ compact = false }: { compact?: boolean }) {
  const world = useWorld((s) => s.world);
  const openGoals = world.goals.filter((g) => g.status !== "done");
  const last = world.events[0];

  if (compact) {
    return (
      <div className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            World
          </span>
          <Badge tone="ok">persists</Badge>
          <Badge>{world.schemaVersion}</Badge>
        </div>
        <p className="mt-2 text-sm text-fg">
          {world.position.place}
          {world.body.deskStatus === "running" ? ` · desk ${world.body.deskStatus}` : ""}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Chat {world.conversation.turns.length} turns. {last?.summary ?? "—"}
        </p>
      </div>
    );
  }

  return (
    <section className="min-w-0">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Saved world</h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {world.schemaVersion} · not Core · chat persists with the world
        </p>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Conversation stays with the world: position, body, possessions, memories,
        relationships, unfinished goals, learned map, recent events, and the chat
        itself. There is no clear. Reload keeps the same thread.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Plane title="Position" hint={world.position.place}>
          {world.position.place} · {Math.round(world.position.x)},{Math.round(world.position.y)}
        </Plane>
        <Plane title="Body" hint={world.body.deskStatus}>
          desk {world.body.deskStatus}
          {world.body.focused ? ` · ${world.body.focused}` : ""} · pointer{" "}
          {Math.round(world.body.pointerX)},{Math.round(world.body.pointerY)}
        </Plane>
        <Plane title="Possessions" hint={String(world.possessions.length)}>
          {world.possessions.slice(0, 4).map((p) => p.title).join(" · ") || "empty"}
        </Plane>
        <Plane title="Memories" hint={String(world.memories.length)}>
          {world.memories.slice(0, 4).map((m) => m.title).join(" · ") || "empty"}
        </Plane>
        <Plane title="Relationships" hint={`${world.relationships.length}`}>
          {world.relationships.map((r) => `${r.role}:${r.status}`).join(" · ")}
        </Plane>
        <Plane title="Goals" hint={`${openGoals.length} open`}>
          {openGoals.map((g) => g.title).join(" · ") || "none"}
        </Plane>
        <Plane
          title="Learned map"
          hint={`${world.map.filter((r) => r.visited).length}/${world.map.length}`}
        >
          {world.map.map((r) => (r.visited ? r.label : r.label.toLowerCase())).join(" · ")}
        </Plane>
        <Plane title="Conversation" hint={`${world.conversation.turns.length} turns`}>
          {world.conversation.turns.length
            ? world.conversation.turns
                .slice(-2)
                .map((t) => `${t.role}: ${t.content.slice(0, 80)}`)
                .join(" · ")
            : "empty — talk in Console"}
        </Plane>
        <Plane title="Recent events" hint={`${world.events.length}`}>
          {world.events.slice(0, 3).map((e) => e.summary).join(" · ") || "none"}
        </Plane>
      </div>
    </section>
  );
}

function Plane({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <article className="min-w-0 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{title}</div>
        <div className="font-mono text-[10px] text-subtle">{hint}</div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-fg">{children}</p>
    </article>
  );
}