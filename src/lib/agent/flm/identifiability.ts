import { auditFibers } from "./partition.ts";
import type {
  RepairCandidate,
  RepresentationSnapshot,
  SurvivorSet,
  TargetContract,
  WorldLedger,
} from "./types.ts";

function withRepair(snapshot: RepresentationSnapshot, repair: RepairCandidate): RepresentationSnapshot {
  return Object.freeze({
    ...snapshot,
    id: `${snapshot.id}+candidate:${repair.id}`,
    parentSnapshotIds: Object.freeze([snapshot.id]),
    viewKeys: Object.freeze([...new Set([...snapshot.viewKeys, ...repair.addKeys])].sort()),
    complexity: snapshot.complexity + repair.addKeys.length,
  });
}

export function evaluateRepairSurvivors(
  ledger: WorldLedger,
  snapshot: RepresentationSnapshot,
  contract: TargetContract,
  candidates: readonly RepairCandidate[],
): SurvivorSet {
  const survivors: RepairCandidate[] = [];
  const rejected: RepairCandidate[] = [];
  for (const candidate of candidates) {
    if (candidate.provenance !== "independent") {
      rejected.push(candidate);
      continue;
    }
    const candidateView = withRepair(snapshot, candidate);
    if (auditFibers(ledger, candidateView, contract).adequate) survivors.push(candidate);
    else rejected.push(candidate);
  }
  const minWidth = survivors.reduce((value, candidate) => Math.min(value, candidate.addKeys.length), Infinity);
  const minimal = survivors
    .filter((candidate) => candidate.addKeys.length === minWidth)
    .map((candidate) => candidate.id)
    .sort();
  return Object.freeze({
    targetContractId: contract.id,
    snapshotId: snapshot.id,
    survivorIds: Object.freeze(minimal),
    rejectedIds: Object.freeze(rejected.map((candidate) => candidate.id).sort()),
    nonIdentifiable: minimal.length > 1,
  });
}
