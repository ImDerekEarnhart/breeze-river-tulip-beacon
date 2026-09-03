import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "drawers",
    n: "01",
    title: "Six drawers, not one prompt",
    body: "This app does not remember by stuffing everything into the last message. Each kind of note has its own drawer. Working is the desk. Semantic is the binder. Episodic is the diary. Procedural is the recipe. Experimental is the lab log. Training is graded homework.",
  },
  {
    id: "prompt",
    n: "02",
    title: "The prompt is not the archive",
    body: "If the worker only “remembers” because a sentence was still on screen, that is leftover speech. A lasting note has to live in a drawer. Open the tabs under this walkthrough to see the drawers that already exist.",
  },
  {
    id: "today",
    n: "03",
    title: "What happens today",
    body: "After a Console run, Guided often copies the answer into Episodic automatically. If a teacher stepped in, it also copies that into Training. It does not ask whether anything checked the claim. Guesses, fail-closed errors, and fluent sentences can all land in the diary.",
  },
  {
    id: "proposal",
    n: "04",
    title: "A proposal is a raised hand",
    body: "We already hash-bind proposals. The worker or teacher can say “here is a candidate.” That receipt always has coreApproved = false. Raising a hand is not permission to write the binder. Hodgeform Core still owns real approval.",
  },
  {
    id: "bouncer",
    n: "05",
    title: "Admission is the bouncer",
    body: "Memory admission means: a lasting note needs a parent receipt. Working sticky notes can stay loose. Diary, binder, lab log, and training should show a stamp — verification, a tool run, or a real Core freeze. Origin is not evidence. “The model said it” is origin.",
  },
  {
    id: "run",
    n: "06",
    title: "One run, in order",
    body: "You ask. Retrieval fetches context (not the Language Tower). The worker proposes. A tool may run. A verifier passes or fails. Only then would a bouncer decide whether a note may stay. A missing student fail-closes. That error must not become a fact in Semantic memory.",
  },
  {
    id: "not",
    n: "07",
    title: "What this is not",
    body: "Not login. Not the student GPU. Not Hodgeform OAuth. Not a language-limit theorem. Not Stage I. Guided may later say “this note may stay in the preview notebook.” Only Core may say “this is a scientific result.” The bouncer is explained here. It is not wired yet.",
  },
  {
    id: "persist",
    n: "08",
    title: "The world does not reset with the chat",
    body: "There is no clear. Position, body, possessions, memory refs, relationships, unfinished goals, the learned map, recent events, and the conversation stay together. Local to this preview. Not Hodgeform Core. Not a Tower VM.",
  },
] as const;

const DRAWERS = [
  { id: "working", title: "Working", picture: "Sticky notes on the desk", stays: "This chat only" },
  { id: "semantic", title: "Semantic", picture: "Reference binder", stays: "Needs a real stamp later" },
  { id: "episodic", title: "Episodic", picture: "Diary of a run", stays: "Needs a run receipt chain" },
  { id: "procedural", title: "Procedural", picture: "Recipe cards / tools", stays: "Designer-supplied, not invented" },
  { id: "experimental", title: "Experimental", picture: "Lab log", stays: "Hash or honest local-only label" },
  { id: "training", title: "Training", picture: "Graded homework", stays: "Verifier fail + explicit teacher route" },
] as const;

export function MemoryWalkthrough() {
  const [id, setId] = useState<(typeof STEPS)[number]["id"]>("drawers");
  const step = STEPS.find((s) => s.id === id) ?? STEPS[0];

  return (
    <section className="mt-8 min-w-0">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Beginner walkthrough</h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          memory admission · not wired yet
        </p>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        This is the tour that lived in chat. Tap a step. The bouncer is the next
        lock to build — it is not running on writes today.
      </p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((s) => {
          const on = s.id === id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setId(s.id)}
              className={cn(
                "h-11 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
                on
                  ? "border-fg/30 bg-bg-subtle text-fg"
                  : "border-border text-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {s.n} {short(s.id)}
            </button>
          );
        })}
      </div>

      <article className="mt-4 rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-5 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          Step {step.n}
        </div>
        <h3 className="mt-2 font-display text-xl tracking-tight">{step.title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{step.body}</p>
      </article>

      {id === "drawers" && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {DRAWERS.map((d) => (
            <li
              key={d.id}
              className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-fg">{d.title}</span>
                <Badge>{d.id}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{d.picture}</p>
              <p className="mt-1 text-xs leading-relaxed text-subtle">{d.stays}</p>
            </li>
          ))}
        </ul>
      )}

      {id === "today" && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <aside className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fail">
              Today
            </div>
            <p className="mt-2 text-sm leading-relaxed text-fg">
              Run finishes → answer is copied into Episodic. Teacher text may
              become Training. No stamp check.
            </p>
          </aside>
          <aside className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ok">
              After the bouncer
            </div>
            <p className="mt-2 text-sm leading-relaxed text-fg">
              Run finishes → proposal stays a proposal until a parent receipt
              admits a lasting note. Fail-closed errors do not become binder facts.
            </p>
          </aside>
        </div>
      )}

      {id === "persist" && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            "Position",
            "Body state",
            "Possessions",
            "Memories",
            "Relationships",
            "Unfinished goals",
            "Learned map",
            "Recent events",
            "Conversation",
          ].map((line) => (
            <li
              key={line}
              className="rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-sm text-fg"
            >
              {line}
            </li>
          ))}
        </ul>
      )}

      {id === "run" && (
        <ol className="mt-4 grid gap-2">
          {[
            "Ask in Console",
            "Retrieval (context receipt) — not the Tower",
            "Worker or teacher proposes (coreApproved = false)",
            "Optional tool (execution receipt)",
            "Verifier pass or fail",
            "Bouncer: admit to a drawer, or keep it working-only",
          ].map((line, i) => (
            <li
              key={line}
              className="flex gap-3 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3"
            >
              <span className="font-mono text-[10px] text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-fg">{line}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function short(id: string) {
  switch (id) {
    case "drawers":
      return "Drawers";
    case "prompt":
      return "Prompt";
    case "today":
      return "Today";
    case "proposal":
      return "Proposal";
    case "bouncer":
      return "Bouncer";
    case "run":
      return "A run";
    case "not":
      return "Not this";
    case "persist":
      return "Persist";
    default:
      return id;
  }
}