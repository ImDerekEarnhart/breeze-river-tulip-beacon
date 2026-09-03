import { cn } from "@/lib/utils";
import type { RunStep, RunTrace } from "@/lib/agent/types";
import type { ReceiptEnvelope } from "@/lib/agent/receipts";

export function PipelineStrip({
  steps,
  visible,
  running,
}: {
  steps: RunStep[];
  visible: number;
  running?: boolean;
}) {
  const shown = steps.slice(0, Math.max(visible, 0));
  return (
    <ol className="flex flex-col gap-2">
      {shown.map((s, i) => {
        const last = i === shown.length - 1 && running && visible < steps.length;
        return (
          <li key={s.id} className="rise-in flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-2 rounded-full",
                  last ? "bg-accent pipeline-live" : "bg-fg/70",
                )}
              />
              {i < shown.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 pb-3">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {s.kind}
                </span>
                {s.model && (
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.12em]",
                      s.model === "teacher" ? "text-teacher" : "text-student",
                    )}
                  >
                    {s.model}
                  </span>
                )}
              </div>
              <div className="text-sm text-fg">{s.title}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{s.detail}</p>
            </div>
          </li>
        );
      })}
      {running && shown.length === 0 && (
        <li className="font-mono text-xs text-muted">
          <span className="shimmer-text">Retrieving context…</span>
        </li>
      )}
    </ol>
  );
}

export function RunMeta({ run }: { run: RunTrace }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
        <span>{run.totalMs} ms</span>
        <span>{run.tokensHint}</span>
        <span className={run.escalated ? "text-teacher" : "text-student"}>{run.modelPath}</span>
        {run.studentModel && <span title="Provider-reported student model">{run.studentModel}</span>}
        {run.teacherModel && <span title="Provider-reported teacher model">{run.teacherModel}</span>}
        <span>{Math.round(run.confidence * 100)}% conf</span>
        {run.route && (
          <span title={`policy ${run.route.policyVersion}`}>
            {run.route.path}:{run.route.reason}
            {run.route.teacherSubstituted ? " · substituted" : ""}
          </span>
        )}
      </div>
      <ReceiptChain receipts={run.receipts} />
    </div>
  );
}

export function ReceiptChain({ receipts }: { receipts?: ReceiptEnvelope[] }) {
  if (!receipts?.length) return null;
  return (
    <ol className="space-y-1">
      {receipts.map((r, i) => {
        const proposal =
          r.payload.type === "proposal"
            ? r.payload
            : null;
        return (
          <li key={r.id} className="min-w-0 font-mono text-[10px] text-muted">
            <span
              className={cn(
                "uppercase tracking-[0.12em]",
                r.kind === "proposal" ? "text-warn" : "text-subtle",
              )}
            >
              {r.kind}
            </span>{" "}
            <span className="break-all text-fg">{r.hash.slice(0, 12)}…</span>
            {proposal ? (
              <span className="text-warn"> · not approved</span>
            ) : null}
            {i > 0 && r.parentReceiptIds[0] ? (
              <span className="text-subtle"> ← {r.parentReceiptIds[0].slice(0, 8)}</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
