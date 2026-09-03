import { Link } from "@tanstack/react-router";
import {
  CORE_LANGUAGE_ADAPTERS,
  GOVERNED_PIPELINE,
  SUPERINTELLIGENCE_STAGES,
  type PipelineStatus,
} from "@/lib/agent/tower/pipeline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<PipelineStatus, string> = {
  core: "Core",
  local_partial: "partial",
  local_control: "control",
  contract_only: "contract",
  blocked: "not run",
};

function statusTone(status: PipelineStatus): "ok" | "live" | "warn" | "default" | "fail" {
  if (status === "core") return "ok";
  if (status === "local_partial") return "live";
  if (status === "local_control") return "warn";
  if (status === "blocked") return "fail";
  return "default";
}

export function GovernedPipeline({
  compact = false,
  activeId,
}: {
  compact?: boolean;
  activeId?: string;
}) {
  return (
    <ol className="flex flex-col">
      {GOVERNED_PIPELINE.map((stage, i) => (
        <li key={stage.id} className="flex gap-3">
          <div className="flex w-4 flex-col items-center">
            <span
              className={cn(
                "mt-1.5 size-2 rounded-full",
                stage.status === "core" && "bg-ok",
                stage.status === "local_partial" && "bg-accent",
                stage.status === "local_control" && "bg-warn",
                stage.status === "contract_only" && "bg-subtle",
                stage.status === "blocked" && "bg-fail/70",
                activeId === stage.id && "ring-2 ring-fg/40 ring-offset-2 ring-offset-bg",
              )}
            />
            {i < GOVERNED_PIPELINE.length - 1 && (
              <span className="mt-1 w-px flex-1 bg-border" />
            )}
          </div>
          <div className={cn("min-w-0 pb-5", compact && "pb-4")}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                {stage.role}
              </span>
              <Badge tone={statusTone(stage.status)}>{STATUS_LABEL[stage.status]}</Badge>
            </div>
            <div className="mt-1 text-sm text-fg">{stage.title}</div>
            {!compact && (
              <p className="mt-1 text-sm leading-relaxed text-muted">{stage.body}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SuperintelligenceStages() {
  return (
    <ol className="grid gap-2">
      {SUPERINTELLIGENCE_STAGES.map((s) => (
        <li
          key={s.id}
          className="grid grid-cols-[auto_1fr] gap-3 rounded-[var(--radius-md)] border border-border px-4 py-3"
        >
          <span className="font-mono text-xs text-subtle">{s.id}</span>
          <div>
            <div className="text-sm text-fg">{s.title}</div>
            <p className="mt-1 text-sm text-muted">{s.here}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CoreLanguageAdapters() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          Orbita adapters
        </span>
        <Badge>Core tools</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        These names are Hodgeform Core operations. This preview lists the contract. It
        does not invent their scientific behavior, and it cannot promote a language
        version.
      </p>
      <ul className="mt-3 space-y-1 font-mono text-[11px] text-fg">
        {CORE_LANGUAGE_ADAPTERS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

export function TowerCta() {
  return (
    <Link
      to="/tower"
      className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-4 text-sm text-fg transition-colors duration-150 hover:border-border-strong hover:bg-bg-subtle"
    >
      Open fiber auditor
    </Link>
  );
}
