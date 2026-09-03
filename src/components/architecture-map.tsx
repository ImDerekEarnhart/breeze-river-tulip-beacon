import { cn } from "@/lib/utils";
import type { StepKind } from "@/lib/agent/types";
import {
  ARCH_NODES,
  NODE_COPY,
  type ArchNodeId,
} from "@/lib/agent/roles";

export type NodeId = ArchNodeId;
export { NODE_COPY };

function activeFor(
  kind: StepKind | undefined,
  node: (typeof ARCH_NODES)[number],
  model?: string,
  tool?: string,
) {
  if (!kind) return false;
  if (node.id === "retrieval") {
    return kind === "retrieve" || (kind === "tool" && tool === "retrieve");
  }
  if (node.id === "tower") {
    return kind === "tool" && (tool === "fiber_diagnose" || tool === "orb1_admit" || tool === "flm_audit");
  }
  if (node.id === "student") {
    return kind === "reason" && model !== "teacher";
  }
  if (node.id === "vllm") {
    return kind === "reason" && model === "student";
  }
  if (node.id === "verify") return kind === "verify";
  if (node.id === "teacher") {
    return kind === "escalate" || (kind === "reason" && model === "teacher") || (kind === "answer" && model === "teacher");
  }
  if (node.id === "desktop") return kind === "tool" && tool === "desktop";
  if (node.id === "sandbox") return kind === "tool" && tool !== "desktop" && tool !== "retrieve" && tool !== "fiber_diagnose" && tool !== "orb1_admit";
  if (node.id === "orbita") return kind === "orbita";
  if (node.id === "orchestrator") return kind === "route" || kind === "verify";
  return node.kinds.includes(kind);
}

export function ArchitectureMap({
  activeKind,
  activeModel,
  activeTool,
  compact = false,
  onSelect,
  selected,
  plane,
}: {
  activeKind?: StepKind;
  activeModel?: string;
  activeTool?: string;
  compact?: boolean;
  selected?: NodeId | null;
  onSelect?: (id: NodeId) => void;
  plane?: "fast" | "govern";
}) {
  const nodes = plane ? ARCH_NODES.filter((n) => n.plane === plane) : ARCH_NODES;
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
      {nodes.map((node) => {
        const on = activeFor(activeKind, node, activeModel, activeTool);
        const isSel = selected === node.id;
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect?.(node.id)}
            className={cn(
              "rounded-[var(--radius-md)] border px-3 py-3 text-left transition-[border-color,background-color] duration-200",
              compact ? "py-2" : "py-3",
              on
                ? "pipeline-live border-accent/60 bg-accent/10"
                : "border-border bg-bg-elevated hover:border-border-strong",
              isSel && "border-fg/40",
            )}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              {node.id}
            </div>
            <div className={cn("mt-1 text-sm text-fg", compact && "text-xs")}>{node.label}</div>
            {!compact && <div className="mt-0.5 text-xs text-muted">{node.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}
