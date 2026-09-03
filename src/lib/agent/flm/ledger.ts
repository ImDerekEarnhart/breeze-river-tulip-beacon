import type { Scalar, WorldLedger, WorldState } from "./types.ts";

export type MutableWorldStateInput = {
  id: string;
  facts: Record<string, Scalar>;
};

export function createWorldLedger(id: string, states: readonly MutableWorldStateInput[]): WorldLedger {
  const seen = new Set<string>();
  const frozenStates: WorldState[] = states.map((state) => {
    if (seen.has(state.id)) throw new Error(`Duplicate world-state id: ${state.id}`);
    seen.add(state.id);
    const facts = Object.freeze({ ...state.facts });
    return Object.freeze({ id: state.id, facts });
  });
  return Object.freeze({ id, states: Object.freeze(frozenStates) });
}

export function rawFact(ledger: WorldLedger, stateId: string, key: string): Scalar | undefined {
  return ledger.states.find((state) => state.id === stateId)?.facts[key];
}
