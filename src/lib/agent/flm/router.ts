import { auditFibers } from "./partition.ts";
import type { RepresentationSnapshot, TargetContract, WorldLedger } from "./types.ts";

export type RouteDecision = Readonly<{
  targetContractId: string;
  selected: RepresentationSnapshot | null;
  adequateSnapshotIds: readonly string[];
}>;

function inScope(snapshot: RepresentationSnapshot, contract: TargetContract): boolean {
  return snapshot.scopeTargetIds === "*" || snapshot.scopeTargetIds.includes(contract.id);
}

export function routeLeastAdequate(
  ledger: WorldLedger,
  contract: TargetContract,
  snapshots: readonly RepresentationSnapshot[],
): RouteDecision {
  const adequate = snapshots.filter((snapshot) => {
    if (snapshot.worldLedgerId !== ledger.id || !inScope(snapshot, contract)) return false;
    if (contract.maxRepresentationCost !== undefined && snapshot.complexity > contract.maxRepresentationCost) {
      return false;
    }
    return auditFibers(ledger, snapshot, contract).adequate;
  });
  adequate.sort((a, b) => {
    if (a.complexity !== b.complexity) return a.complexity - b.complexity;
    const aWidth = new Set([...a.viewKeys, ...a.observationKeys]).size;
    const bWidth = new Set([...b.viewKeys, ...b.observationKeys]).size;
    if (aWidth !== bWidth) return aWidth - bWidth;
    return a.id.localeCompare(b.id);
  });
  return Object.freeze({
    targetContractId: contract.id,
    selected: adequate[0] ?? null,
    adequateSnapshotIds: Object.freeze(adequate.map((snapshot) => snapshot.id)),
  });
}
