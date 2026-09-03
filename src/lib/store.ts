import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ARCHIVED_EXPERIMENTS } from "@/lib/agent/archive";
import { useDesktop } from "@/lib/desktop-store";
import { useWorld } from "@/lib/world-store";
import type {
  AgentMode,
  MemoryItem,
  OrbitaRecord,
  RunTrace,
  TrainingRecord,
} from "@/lib/agent/types";

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  runId?: string;
};

type LabState = {
  mode: AgentMode;
  turns: ChatTurn[];
  runs: RunTrace[];
  experiments: OrbitaRecord[];
  traces: TrainingRecord[];
  memories: MemoryItem[];
  activeRunId: string | null;
  replayIndex: number;
  setMode: (mode: AgentMode) => void;
  setReplayIndex: (n: number) => void;
  setActiveRun: (id: string | null) => void;
  addUserTurn: (content: string) => string;
  completeRun: (userTurnId: string, run: RunTrace) => void;
  failUserTurn: (userTurnId: string, message: string) => void;
  approveExperiment: (caseId: string) => void;
  remember: (item: MemoryItem) => void;
};

const seedMemories: MemoryItem[] = [
  {
    id: "sem-tower",
    kind: "semantic",
    title: "Language tower",
    body: "Current executable L_t — not retrieval. This preview's BM25 layer is a separate retrieval subsystem. Fiber collision is a local exact control. Orbita governs promotion.",
    createdAt: 0,
  },
  {
    id: "proc-tools",
    kind: "procedural",
    title: "Allowed tools",
    body: "sandbox, retrieve, memory_read, memory_write, orbita_status, fiber_diagnose, orb1_admit, flm_audit, desktop. Desktop is screenshot/click/type/launch only — never root. orb1_admit is a local Q(i) ring gate. flm_audit is a local FLM kernel, not Core.",
    createdAt: 0,
  },
  {
    id: "exp-rerank",
    kind: "experimental",
    title: "Rerank P@5",
    body: "Archived governed result: BM25+rerank P@5 0.78 vs 0.62. Hash a1b0c2d3…",
    createdAt: 0,
  },
];

export const useLab = create<LabState>()(
  persist(
    (set) => ({
      mode: "fast",
      turns: [],
      runs: [],
      experiments: ARCHIVED_EXPERIMENTS,
      traces: [
        {
          id: "tr-seed-1",
          prompt: "When should the worker escalate?",
          studentAttempt: "Always call the teacher for any architecture question.",
          teacherAnswer:
            "Escalate only if confidence < 0.55, verification fails, or a governed plan is required. Ordinary retrieval stays on the student. A missing student does not become the teacher.",
          verification: "quarantined",
          createdAt: 0,
          status: "quarantined",
          educationPass: null,
          educationReason: "Seed fixture. Not independently scored in this preview. Not Core.",
          coreApproved: false,
        },
      ],
      memories: seedMemories,
      activeRunId: null,
      replayIndex: 0,
      setMode: (mode) => set({ mode }),
      setReplayIndex: (replayIndex) => set({ replayIndex }),
      setActiveRun: (activeRunId) => set({ activeRunId, replayIndex: 0 }),
      addUserTurn: (content) => {
        const id = crypto.randomUUID();
        const at = Date.now();
        useWorld.getState().noteTurn({ id, role: "user", content, runId: "", at });
        set((s) => ({
          turns: [...s.turns, { id, role: "user", content }],
        }));
        return id;
      },
      completeRun: (userTurnId, run) =>
        set((s) => {
          const memories = [...s.memories];
          memories.unshift({
            id: `epi-${run.id.slice(0, 8)}`,
            kind: "episodic",
            title: run.request.slice(0, 72),
            body: run.answer.slice(0, 280),
            createdAt: run.createdAt,
          });
          if (run.training) {
            memories.unshift({
              id: `train-${run.training.id}`,
              kind: "training",
              title: run.training.status === "local_pass" ? "Teacher correction · local pass" : "Teacher correction · quarantined",
              body: run.training.teacherAnswer.slice(0, 240),
              createdAt: run.training.createdAt,
            });
          }
          if (run.orbita) {
            memories.unshift({
              id: `exp-${run.orbita.caseId}`,
              kind: "experimental",
              title: run.orbita.caseId,
              body: `hash ${run.orbita.planHash.slice(0, 12)} · ${run.orbita.status}`,
              createdAt: run.orbita.createdAt,
            });
          }
          if (run.desktop) {
            useDesktop.getState().hydrate(run.desktop);
            useWorld.getState().noteDesk(run.desktop);
            memories.unshift({
              id: `desk-${run.id.slice(0, 8)}`,
              kind: "episodic",
              title: "PocketDesktop",
              body: `status ${run.desktop.status} · focused ${run.desktop.focused || "none"}`,
              createdAt: run.createdAt,
            });
          }
          useWorld.getState().noteRun(run);
          useWorld.getState().noteTurn({
            id: `a-${run.id}`,
            role: "assistant",
            content: run.answer,
            runId: run.id,
            at: run.createdAt,
          });
          return {
            turns: [
              ...s.turns,
              {
                id: `a-${run.id}`,
                role: "assistant",
                content: run.answer,
                runId: run.id,
              },
            ],
            runs: [run, ...s.runs].slice(0, 40),
            traces: run.training ? [run.training, ...s.traces].slice(0, 40) : s.traces,
            experiments: run.orbita
              ? [run.orbita, ...s.experiments.filter((e) => e.caseId !== run.orbita?.caseId)].slice(
                  0,
                  30,
                )
              : s.experiments,
            memories: memories.slice(0, 80),
            activeRunId: run.id,
            replayIndex: 0,
          };
        }),
      failUserTurn: (userTurnId, message) => {
        const id = `err-${userTurnId}`;
        useWorld.getState().noteTurn({
          id,
          role: "assistant",
          content: message,
          runId: "",
          at: Date.now(),
        });
        set((s) => ({
          turns: [...s.turns, { id, role: "assistant", content: message }],
        }));
      },
      approveExperiment: (caseId) =>
        set((s) => ({
          experiments: s.experiments.map((e) =>
            e.caseId === caseId && e.status === "frozen" ? { ...e, status: "approved" } : e,
          ),
        })),
      remember: (item) => set((s) => ({ memories: [item, ...s.memories].slice(0, 80) })),
    }),
    { name: "orbita-lab-v2" },
  ),
);

export function reconcileConversation() {
  const worldTurns = useWorld.getState().world.conversation.turns;
  const lab = useLab.getState();
  if (worldTurns.length > lab.turns.length) {
    useLab.setState({
      turns: worldTurns.map((t) => ({
        id: t.id,
        role: t.role,
        content: t.content,
        runId: t.runId || undefined,
      })),
    });
  } else if (lab.turns.length > worldTurns.length) {
    useWorld.getState().absorbTurns(
      lab.turns.map((t) => ({
        id: t.id,
        role: t.role,
        content: t.content,
        runId: t.runId ?? "",
        at: 0,
      })),
    );
  }
}
