import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeskSnapshot } from "@/lib/desktop";
import type { RunTrace } from "@/lib/agent/types";
import {
  applyDeskBody,
  applyRun,
  applyTurn,
  applyVisit,
  migrateWorld,
  replaceConversation,
  seedWorld,
  type WorldPlace,
  type WorldState,
  type WorldTurn,
} from "@/lib/world";

type WorldStore = {
  world: WorldState;
  visit: (place: WorldPlace) => void;
  noteDesk: (snap: DeskSnapshot) => void;
  noteRun: (run: RunTrace) => void;
  noteTurn: (turn: WorldTurn) => void;
  absorbTurns: (turns: WorldTurn[]) => void;
};

export const useWorld = create<WorldStore>()(
  persist(
    (set, get) => ({
      world: seedWorld(0),
      visit: (place) => {
        const at = Date.now();
        set({ world: applyVisit(get().world, place, at) });
      },
      noteDesk: (snap) => {
        set({
          world: applyDeskBody(
            get().world,
            {
              deskStatus: snap.status,
              focused: snap.focused,
              pointerX: snap.pointerX,
              pointerY: snap.pointerY,
            },
            Date.now(),
          ),
        });
      },
      noteRun: (run) => {
        const last = run.receipts?.[run.receipts.length - 1];
        set({
          world: applyRun(
            get().world,
            {
              request: run.request,
              answer: run.answer,
              receiptHash: last?.hash,
              memoryId: `epi-${run.id.slice(0, 8)}`,
              memoryKind: "episodic",
              memoryTitle: run.request,
            },
            Date.now(),
          ),
        });
      },
      noteTurn: (turn) => {
        set({ world: applyTurn(get().world, turn, Date.now()) });
      },
      absorbTurns: (turns) => {
        set({ world: replaceConversation(get().world, turns, Date.now()) });
      },
    }),
    {
      name: "guided-world-v1",
      merge: (persisted, current) => {
        const p = persisted as { world?: Partial<WorldState> } | undefined;
        return { ...current, world: migrateWorld(p?.world) };
      },
    },
  ),
);