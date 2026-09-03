import { useState } from "react";
import { ArchitectureMap, NODE_COPY, type NodeId } from "@/components/architecture-map";
import { SystemPlane } from "@/components/system-plane";
import {
  CoreLanguageAdapters,
  GovernedPipeline,
  SuperintelligenceStages,
  TowerCta,
} from "@/components/governed-pipeline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "system", label: "System" },
  { id: "layers", label: "Layers" },
  { id: "pipeline", label: "Pipeline" },
  { id: "stages", label: "Stages" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PHASES = [
  {
    n: "01",
    title: "Worker loop",
    body: "Controller, local student via vLLM, tools, verifier. One agent that can finish a structured task.",
  },
  {
    n: "02",
    title: "Retrieval",
    body: "Context for the student. Here: lexical BM25 + rerank. Not embeddings yet, and not the Language Tower.",
  },
  {
    n: "03",
    title: "Language tower",
    body: "Current executable L_t. Detect coarse holes and nuisance splits. The Tower may propose a version. It may not promote it.",
  },
  {
    n: "04",
    title: "Teacher routing",
    body: "Student first. Teacher only with an explicit reason. Missing student fail-closes. Collect traces.",
  },
  {
    n: "05",
    title: "Orbita",
    body: "Teacher proposes. Plan is hashed. Approval boundary. Discovery. Independent evaluation. Promotion stays with Core.",
  },
  {
    n: "06",
    title: "Improve the worker",
    body: "Failures → teacher → falsification → training set → LoRA. The worker never rewrites itself.",
  },
  {
    n: "07",
    title: "PocketDesktop",
    body: "A private XFCE target with a narrow API. Screenshots, pointer, keys, allow-listed apps. Never sudo.",
  },
];

export function ArchitectureView() {
  const [selected, setSelected] = useState<NodeId | null>("orchestrator");
  const [tab, setTab] = useState<TabId>("system");

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
          System
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
          Retrieval is not the Tower.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Student is the GPU worker. vLLM only serves it. Teacher is explicit escalation,
          never a silent fallback. Orbita governs change. Optional plugins stay quarantined.
          Click a box.
        </p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "h-11 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
              tab === t.id
                ? "border-fg/30 bg-bg-subtle text-fg"
                : "border-border text-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "system" && <SystemPlane selected={selected} onSelect={setSelected} />}
      {tab === "layers" && <LayersPanel selected={selected} onSelect={setSelected} />}
      {tab === "pipeline" && <PipelinePanel />}
      {tab === "stages" && <StagesPanel />}
    </div>
  );
}

function LayersPanel({
  selected,
  onSelect,
}: {
  selected: NodeId | null;
  onSelect: (id: NodeId) => void;
}) {
  return (
    <>
      <div className="mt-8 space-y-6">
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Fast path
          </div>
          <ArchitectureMap selected={selected} onSelect={onSelect} plane="fast" />
        </div>
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Governance
          </div>
          <ArchitectureMap selected={selected} onSelect={onSelect} plane="govern" />
        </div>
      </div>

      {selected && (
        <div className="mt-5 max-w-2xl rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-5 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            {selected}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-fg">{NODE_COPY[selected]}</p>
          {selected === "tower" && (
            <div className="mt-4">
              <TowerCta />
            </div>
          )}
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Two loops</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <Badge tone="student">Fast</Badge>
            <h3 className="mt-3 text-lg text-fg">Milliseconds to seconds</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              User → retrieve → student (via vLLM) → tool → verify → answer. HodgeForm is
              not on this path. Tools never share a process with the model.
            </p>
          </article>
          <article className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <Badge tone="teacher">Governed</Badge>
            <h3 className="mt-3 text-lg text-fg">When the claim matters</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Case → teacher plan → SHA-256 freeze → approval → discovery → sandbox
              → independent evaluation. A proposal is not a result. Inactive until a human
              or deployment boundary says otherwise.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-12 pb-8">
        <h2 className="font-display text-2xl tracking-tight">Build order</h2>
        <ol className="mt-4 grid gap-3">
          {PHASES.map((p) => (
            <li
              key={p.n}
              className="grid grid-cols-[auto_1fr] gap-4 rounded-[var(--radius-md)] border border-border px-4 py-3"
            >
              <span className="font-mono text-xs text-subtle">{p.n}</span>
              <div>
                <div className="text-sm text-fg">{p.title}</div>
                <p className="mt-1 text-sm text-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function PipelinePanel() {
  return (
    <section className="mt-8 grid gap-10 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div>
        <h2 className="font-display text-2xl tracking-tight">
          Representation audit and repair
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          The Language Tower is current executable L_t. Unaskable Questions is its
          metacognitive loop. ORB-L is provenance. Orbita decides which frozen evidence
          changes the durable knowledge state. Retrieval does not live in this column.
        </p>
        <div className="mt-6">
          <GovernedPipeline />
        </div>
      </div>
      <div className="space-y-5">
        <article className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Failure types
          </div>
          <h3 className="mt-3 text-lg text-fg">Too coarse / too fine</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A coarse hole: π merges states that the target must distinguish. A nuisance
            split: π separates states the target treats as the same. Learn what to
            notice, and what to ignore.
          </p>
        </article>
        <article className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Diagnosis
          </div>
          <h3 className="mt-3 text-lg text-fg">SEARCH_FAILURE vs LANGUAGE_LIMIT</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Finite search that found no discriminator is SEARCH_FAILURE. A language
            limit is a machine-checkable argument that the entire declared grammar is
            blind. This preview issues neither from BM25 retrieval.
          </p>
        </article>
        <CoreLanguageAdapters />
        <TowerCta />
      </div>
    </section>
  );
}

function StagesPanel() {
  return (
    <section className="mt-8 pb-8">
      <h2 className="font-display text-2xl tracking-tight">What counts as progress</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Do not use the word superintelligence because a score is high. Use milestones.
        Stage I is explicitly refused.
      </p>
      <div className="mt-6 max-w-2xl">
        <SuperintelligenceStages />
      </div>
      <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted">
        The compounding test is later: verified prior repairs should improve future
        discovery without an explosion in unsupported claims. That experiment is not
        run here.
      </p>
      <div className="mt-6">
        <TowerCta />
      </div>
    </section>
  );
}
