import { canonicalize, uniqueSorted } from "./canonical.ts";
import type {
  FiberAudit,
  NuisanceAudit,
  RepresentationSnapshot,
  Scalar,
  TargetContract,
  WorldLedger,
  WorldState,
} from "./types.ts";

export function visibleKeys(snapshot: RepresentationSnapshot): string[] {
  return uniqueSorted([...snapshot.viewKeys, ...snapshot.observationKeys]);
}

export function representationKey(state: WorldState, keys: readonly string[]): string {
  const tuple = keys.map((key) => [
    key,
    Object.prototype.hasOwnProperty.call(state.facts, key)
      ? state.facts[key]
      : { __flm_missing__: true },
  ]);
  return canonicalize(tuple);
}

function requiredFact(state: WorldState, key: string): Scalar {
  if (!Object.prototype.hasOwnProperty.call(state.facts, key)) {
    throw new Error(`Target fact ${key} is missing from world state ${state.id}`);
  }
  return state.facts[key];
}

export function partition(
  ledger: WorldLedger,
  snapshot: RepresentationSnapshot,
): Map<string, WorldState[]> {
  const keys = visibleKeys(snapshot);
  const groups = new Map<string, WorldState[]>();
  for (const state of ledger.states) {
    const key = representationKey(state, keys);
    const row = groups.get(key);
    if (row) row.push(state);
    else groups.set(key, [state]);
  }
  return groups;
}

function targetKeys(contract: TargetContract): string[] {
  return uniqueSorted([contract.targetKey, ...contract.protectedTargetKeys]);
}

function uniqueScalars(values: readonly Scalar[]): Scalar[] {
  const seen = new Map<string, Scalar>();
  for (const value of values) seen.set(canonicalize(value), value);
  return [...seen.values()];
}

export function auditFibers(
  ledger: WorldLedger,
  snapshot: RepresentationSnapshot,
  contract: TargetContract,
): FiberAudit {
  if (ledger.id !== snapshot.worldLedgerId) {
    throw new Error(`Snapshot ${snapshot.id} belongs to ${snapshot.worldLedgerId}, not ${ledger.id}`);
  }
  const collisions: FiberAudit["collisions"][number][] = [];
  const groups = partition(ledger, snapshot);
  for (const [key, states] of groups) {
    for (const targetKey of targetKeys(contract)) {
      const values = uniqueScalars(states.map((state) => requiredFact(state, targetKey)));
      if (values.length > 1) {
        collisions.push({
          targetKey,
          representationKey: key,
          stateIds: states.map((state) => state.id).sort(),
          targetValues: values,
        });
      }
    }
  }
  return Object.freeze({
    snapshotId: snapshot.id,
    targetContractId: contract.id,
    visibleKeys: Object.freeze(visibleKeys(snapshot)),
    adequate: collisions.length === 0,
    collisions: Object.freeze(collisions),
  });
}

export function auditNuisanceSplits(
  ledger: WorldLedger,
  snapshot: RepresentationSnapshot,
  contract: TargetContract,
): NuisanceAudit {
  const keys = visibleKeys(snapshot);
  const protectedKeys = targetKeys(contract);
  const splits: NuisanceAudit["splits"][number][] = [];

  for (let i = 0; i < ledger.states.length; i += 1) {
    for (let j = i + 1; j < ledger.states.length; j += 1) {
      const a = ledger.states[i];
      const b = ledger.states[j];
      const sameTargets = protectedKeys.every((key) => requiredFact(a, key) === requiredFact(b, key));
      if (!sameTargets) continue;
      const aRep = representationKey(a, keys);
      const bRep = representationKey(b, keys);
      if (aRep === bRep) continue;
      const sameTargetValues: Record<string, Scalar> = {};
      for (const key of protectedKeys) sameTargetValues[key] = requiredFact(a, key);
      splits.push({
        stateA: a.id,
        stateB: b.id,
        sameTargetValues: Object.freeze(sameTargetValues),
        representationA: aRep,
        representationB: bRep,
      });
    }
  }
  return Object.freeze({
    snapshotId: snapshot.id,
    targetContractId: contract.id,
    splits: Object.freeze(splits),
  });
}

export function isPartitionRefinement(
  ledger: WorldLedger,
  finer: RepresentationSnapshot,
  coarser: RepresentationSnapshot,
): boolean {
  const fineKeys = visibleKeys(finer);
  const coarseKeys = visibleKeys(coarser);
  for (let i = 0; i < ledger.states.length; i += 1) {
    for (let j = i + 1; j < ledger.states.length; j += 1) {
      const a = ledger.states[i];
      const b = ledger.states[j];
      const sameFine = representationKey(a, fineKeys) === representationKey(b, fineKeys);
      if (!sameFine) continue;
      const sameCoarse = representationKey(a, coarseKeys) === representationKey(b, coarseKeys);
      if (!sameCoarse) return false;
    }
  }
  return true;
}
