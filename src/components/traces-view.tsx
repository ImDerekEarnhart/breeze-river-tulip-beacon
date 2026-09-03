import { useMemo } from "react";
import { useLab } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { ReceiptChain } from "@/components/pipeline-strip";

export function TracesView() {
  const traces = useLab((s) => s.traces);
  const runs = useLab((s) => s.runs);

  const stats = useMemo(() => {
    const student = runs.filter((r) => r.modelPath === "student").length;
    const mixed = runs.filter((r) => r.modelPath === "student→teacher").length;
    const teacher = runs.filter((r) => r.modelPath === "teacher").length;
    const max = Math.max(1, student, mixed, teacher);
    return [
      { name: "Student", n: student, max },
      { name: "Escalated", n: mixed, max },
      { name: "Governed", n: teacher, max },
    ];
  }, [runs]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
        Training memory
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">
        Failures become data.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        When the education scorer has an expected label, it grades the teacher
        answer independently. No label → the pair stays quarantined. Local pass
        is not Hodgeform Core admission, and not a LoRA write.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Runs" value={String(runs.length)} />
        <Stat label="Escalations" value={String(runs.filter((r) => r.escalated).length)} />
        <Stat label="Training pairs" value={String(traces.length)} />
      </div>

      <div className="mt-8 space-y-3 rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-4">
        {stats.map((s) => (
          <div key={s.name}>
            <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              <span>{s.name}</span>
              <span className="tabular-nums">{s.n}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(4, (s.n / s.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {runs[0]?.route && (
        <article className="mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            Latest route
          </div>
          <p className="mt-2 font-mono text-sm text-fg">
            {runs[0].route.path} · {runs[0].route.reason} · substituted=
            {String(runs[0].route.teacherSubstituted)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Policy {runs[0].route.policyVersion}. Teacher is never a silent fallback.
          </p>
        </article>
      )}

      {runs[0]?.receipts && runs[0].receipts.length > 0 && (
        <article className="mt-8 min-w-0 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            Latest run receipts
          </div>
          <p className="mt-2 text-sm text-muted">
            Guided interchange hashes. A proposal is not Hodgeform Core approval.
          </p>
          <div className="mt-3">
            <ReceiptChain receipts={runs[0].receipts} />
          </div>
        </article>
      )}

      <ul className="mt-8 space-y-3 pb-10">
        {traces.length === 0 && (
          <li className="text-sm text-muted">
            No teacher corrections yet. Trigger an escalation from Console.
          </li>
        )}
        {traces.map((t) => (
          <li
            key={t.id}
            className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="fail">student miss</Badge>
              <Badge
                tone={
                  t.status === "local_pass" ? "ok" : t.status === "local_fail" ? "fail" : "warn"
                }
              >
                {t.status ?? "quarantined"}
              </Badge>
              <span className="font-mono text-[10px] text-subtle">{t.id}</span>
            </div>
            {t.educationReason && (
              <p className="mt-2 text-xs leading-relaxed text-muted">{t.educationReason}</p>
            )}
            <p className="mt-2 text-sm text-fg">{t.prompt}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-student">
                  Student
                </div>
                <p className="mt-1 text-sm text-muted">{t.studentAttempt}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-teacher">
                  Teacher
                </div>
                <p className="mt-1 text-sm text-muted">{t.teacherAnswer}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl tabular-nums">{value}</div>
    </div>
  );
}
