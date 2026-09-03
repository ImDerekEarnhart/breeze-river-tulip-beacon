import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { runAgent } from "@/lib/agent/api";
import { useLab } from "@/lib/store";
import { useDesktop } from "@/lib/desktop-store";
import { cn } from "@/lib/utils";
import { ArchitectureMap } from "@/components/architecture-map";
import { InfraPanel } from "@/components/infra-panel";
import { PipelineStrip, RunMeta } from "@/components/pipeline-strip";
import { WorldPlane } from "@/components/world-plane";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SAMPLES = [
  {
    label: "Routing",
    text: "Is retrieval the Language Tower? If the student GPU is missing, does Guided silently call the teacher?",
  },
  {
    label: "Architecture",
    text: "Why shouldn't the agent live inside vLLM, and when does the student escalate to the teacher?",
  },
  {
    label: "Tower",
    text: "What is the Language Tower in the manifesto pipeline, and how does a fiber collision differ from a LANGUAGE_LIMIT?",
  },
  {
    label: "Sandbox",
    text: "Use the sandbox to compute the future value of $10,000 compounded at 7% annually for 12 years.",
  },
  {
    label: "Memory",
    text: "What are the six memory kinds Orbita keeps outside the prompt window?",
  },
  {
    label: "ORB-1",
    text: "Admit coordinate derivation D on Q(i)[Z^d], then say why the π/4 shift is quarantined. This is not a Core LANGUAGE_LIMIT.",
  },
  {
    label: "FLM",
    text: "Run the Fiber Lattice Machine refine demo. Say why a candidate cannot self-admit, and that this is not Hodgeform Core.",
  },
  {
    label: "Proposal",
    text: "What is a proposal receipt, and why does coreApproved stay false even after the teacher writes a plan?",
  },
  {
    label: "World",
    text: "Does the conversation stay with the saved world after a reload, or does Guided reset the transcript?",
  },
  {
    label: "Desktop",
    text: "Take a PocketDesktop screenshot and say which apps are allow-listed. Do not use sudo.",
  },
  {
    label: "Governed",
    text: "Propose a governed experiment: does requiring JSON schema on the worker reduce tool parse failures?",
  },
];

export function ConsoleView() {
  const mode = useLab((s) => s.mode);
  const setMode = useLab((s) => s.setMode);
  const turns = useLab((s) => s.turns);
  const runs = useLab((s) => s.runs);
  const activeRunId = useLab((s) => s.activeRunId);
  const replayIndex = useLab((s) => s.replayIndex);
  const setReplayIndex = useLab((s) => s.setReplayIndex);
  const addUserTurn = useLab((s) => s.addUserTurn);
  const completeRun = useLab((s) => s.completeRun);
  const failUserTurn = useLab((s) => s.failUserTurn);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const active = runs.find((r) => r.id === activeRunId) ?? runs[0];
  const visibleSteps = active ? replayIndex : 0;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, busy]);

  useEffect(() => {
    if (!active || busy) return;
    setReplayIndex(1);
    if (active.steps.length <= 1) return;
    let i = 1;
    const id = window.setInterval(() => {
      i += 1;
      setReplayIndex(i);
      if (i >= active.steps.length) window.clearInterval(id);
    }, 260);
    return () => window.clearInterval(id);
  }, [active?.id, busy, setReplayIndex]);

  const liveKind = useMemo(() => {
    if (!active) return undefined;
    const idx = Math.max(0, Math.min(visibleSteps, active.steps.length) - 1);
    return active.steps[idx]?.kind;
  }, [active, visibleSteps]);

  const liveModel = useMemo(() => {
    if (!active) return undefined;
    const idx = Math.max(0, Math.min(visibleSteps, active.steps.length) - 1);
    return active.steps[idx]?.model;
  }, [active, visibleSteps]);

  const liveTool = useMemo(() => {
    if (!active) return undefined;
    const idx = Math.max(0, Math.min(visibleSteps, active.steps.length) - 1);
    return active.steps[idx]?.data?.name;
  }, [active, visibleSteps]);

  async function submit(text: string, nextMode = mode) {
    const request = text.trim();
    if (!request || busy) return;
    setDraft("");
    setBusy(true);
    const history = useLab
      .getState()
      .turns.slice(-6)
      .map((t) => ({ role: t.role, content: t.content }));
    const turnId = addUserTurn(request);
    try {
      const run = await runAgent({
        data: {
          request,
          mode: nextMode,
          history,
          desktop: useDesktop.getState().snap,
        },
      });
      completeRun(turnId, run);
    } catch (e) {
      failUserTurn(turnId, e instanceof Error ? e.message : "Agent failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid md:min-h-dvh md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
      <section className="flex h-[calc(100dvh-7.25rem)] min-h-0 flex-col border-b border-border md:h-dvh md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
          <div>
            <h1 className="font-display text-xl tracking-tight md:text-2xl">Guided</h1>
            <p className="text-xs text-muted">Ask · analyze · govern — chat stays with the world</p>
          </div>
          <div className="flex items-center gap-2">
            <ModeSwitch mode={mode} onChange={setMode} disabled={busy} />
          </div>
        </div>

        <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6">
          {turns.length === 0 && (
            <EmptyState
              onPick={(s) => {
                if (s.label === "Governed") setMode("governed");
                void submit(s.text, s.label === "Governed" ? "governed" : mode);
              }}
            />
          )}
          {turns.map((t) => {
            const run = t.runId ? runs.find((r) => r.id === t.runId) : undefined;
            return (
              <article key={t.id} className="rise-in">
                {t.role === "user" ? (
                  <p className="ml-auto max-w-[46rem] rounded-[var(--radius-lg)] bg-bg-subtle px-4 py-3 text-sm leading-relaxed">
                    {t.content}
                  </p>
                ) : (
                  <div className="max-w-[46rem] rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {run && (
                        <>
                          <Badge tone={run.escalated ? "teacher" : "student"}>
                            {run.modelPath}
                          </Badge>
                          <Badge tone={run.status === "ok" ? "ok" : "fail"}>{run.status}</Badge>
                          {run.orbita && <Badge tone="live">governed</Badge>}
                        </>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">
                      {t.content}
                    </p>
                    {run && (
                      <div className="mt-3 space-y-2">
                        <RunMeta run={run} />
                        <details className="md:hidden">
                          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                            Pipeline · {run.steps.length} steps
                          </summary>
                          <div className="mt-2">
                            <PipelineStrip
                              steps={run.steps}
                              visible={run.steps.length}
                            />
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <LoaderCircle className="size-4 animate-spin" />
              <span className="shimmer-text">
                {mode === "governed" ? "Freezing a plan…" : "Worker is running…"}
              </span>
            </div>
          )}
        </div>

        <form
          className="border-t border-border p-3 md:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(draft);
          }}
        >
          <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit(draft);
                }
              }}
              placeholder={
                mode === "governed"
                  ? "Ask for a claim you actually want tested…"
                  : "Ask the worker. Escalate only if it must."
              }
              rows={2}
              className="border-0 bg-transparent focus:ring-0"
              disabled={busy}
            />
            <Button
              type="submit"
              size="icon"
              disabled={busy || !draft.trim()}
              aria-label="Send"
            >
              <ArrowUp />
            </Button>
          </div>
          <p className="mt-2 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {mode === "governed"
              ? "Governed · Hodgeform Core freeze/approve (fail-closed without MCP)"
              : "Fast loop · worker first · teacher only with a reason · never a silent fallback"}

          </p>
        </form>
      </section>

      <aside className="hidden min-h-0 flex-col bg-bg md:flex">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Live layers
          </div>
          <h2 className="mt-1 text-sm text-fg">Architecture while it thinks</h2>
        </div>
        <div className="space-y-5 overflow-y-auto px-4 py-4 md:px-5">
          <WorldPlane compact />
          <InfraPanel />
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Fast path
            </div>
            <ArchitectureMap
              compact
              plane="fast"
              activeKind={liveKind}
              activeModel={liveModel}
              activeTool={liveTool}
            />
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Governance
            </div>
            <ArchitectureMap
              compact
              plane="govern"
              activeKind={liveKind}
              activeModel={liveModel}
              activeTool={liveTool}
            />
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Pipeline
            </div>
            {active ? (
              <PipelineStrip
                steps={active.steps}
                visible={Math.max(visibleSteps, busy ? 2 : 0)}
                running={busy}
              />
            ) : (
              <p className="text-sm text-muted">
                Send a request to watch retrieve, route, tools, and verify light up.
              </p>
            )}
          </div>
          {active && active.retrieved.length > 0 && (
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                Tower hits
              </div>
              <ul className="space-y-2">
                {active.retrieved.slice(0, 4).map((d) => (
                  <li key={d.id} className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-fg">{d.title}</span>
                      <span className="font-mono text-[10px] text-subtle">
                        {d.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-muted">{d.id}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function ModeSwitch({
  mode,
  onChange,
  disabled,
}: {
  mode: "fast" | "governed";
  onChange: (m: "fast" | "governed") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex rounded-[var(--radius-sm)] border border-border p-0.5">
      {(["fast", "governed"] as const).map((m) => (
        <button
          key={m}
          type="button"
          disabled={disabled}
          onClick={() => onChange(m)}
          className={cn(
            "h-8 rounded-[6px] px-3 font-mono text-[10px] uppercase tracking-[0.12em]",
            mode === m ? "bg-bg-subtle text-fg" : "text-muted",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: (typeof SAMPLES)[number]) => void }) {
  return (
    <div className="mx-auto max-w-lg py-6 md:py-16">
      <p className="font-display text-3xl tracking-tight text-fg md:text-4xl">
        Hodgeform Guided
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Models propose. Hodgeform Core freezes, executes, and bounds claims.
        Worker and teacher are roles on a replaceable OpenAI-compatible
        provider — not proof of a local vLLM or a desktop VM.
      </p>
      <div className="mt-6 grid gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-left transition-colors duration-150 hover:border-border-strong"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              {s.label}
            </div>
            <div className="mt-1 text-sm text-fg">{s.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
