import { useState } from "react";
import { runEducationExam } from "@/lib/agent/api";
import { ARCHITECTURE_LOOP } from "@/lib/agent/roles";
import { SMOKE_SUITE_ID } from "@/lib/agent/education";
import { Badge } from "@/components/ui/badge";

type ExamState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; ok: boolean; message: string; teacherCalled: boolean };

export function EducationExamCard() {
  const [state, setState] = useState<ExamState>({ phase: "idle" });

  async function run() {
    setState({ phase: "running" });
    try {
      const result = await runEducationExam();
      setState({
        phase: "done",
        ok: result.ok,
        message: result.message,
        teacherCalled: result.teacherCalled,
      });
    } catch (err) {
      setState({
        phase: "done",
        ok: false,
        message: err instanceof Error ? err.message : "Exam failed to run.",
        teacherCalled: false,
      });
    }
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl tracking-tight">Education smoke exam</h2>
        <Badge tone="warn">local only</Badge>
        <Badge tone="default">{SMOKE_SUITE_ID}</Badge>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Core named a verifier repair ({ARCHITECTURE_LOOP.candidateHash.slice(0, 12)}…) with
        activation false. This is an operator-visible English suite, not a held-out
        benchmark, not LANGUAGE_LIMIT, and not Core admission.
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        {ARCHITECTURE_LOOP.state} · {ARCHITECTURE_LOOP.diagnosedLimitation} · activation{" "}
        {String(ARCHITECTURE_LOOP.activationRequested)} · core approved{" "}
        {String(ARCHITECTURE_LOOP.coreApproved)}
      </p>
      <button
        type="button"
        onClick={() => void run()}
        disabled={state.phase === "running"}
        className="mt-3 rounded-full border border-border bg-bg px-4 py-2 text-sm text-fg disabled:opacity-50"
      >
        {state.phase === "running" ? "Running…" : "Run student-only exam"}
      </button>
      {state.phase === "done" && (
        <p className={`mt-3 text-sm leading-relaxed ${state.ok ? "text-ok" : "text-muted"}`}>
          {state.message} Teacher called: {String(state.teacherCalled)}.
        </p>
      )}
    </section>
  );
}
