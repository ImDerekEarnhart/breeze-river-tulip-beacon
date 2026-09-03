import { uniqueSorted } from "./canonical.ts";
import type {
  AdmissionRecord,
  CandidateDelta,
  RepresentationSnapshot,
} from "./types.ts";

function buildSnapshot(
  candidate: CandidateDelta,
  admission: AdmissionRecord,
  parents: readonly RepresentationSnapshot[],
): RepresentationSnapshot {
  const semantic = candidate.semantic;
  if (semantic.parentSnapshotIds.length !== parents.length) {
    throw new Error("Parent snapshot count does not match semantic delta");
  }
  const parentIds = parents.map((p) => p.id).sort();
  const expectedIds = [...semantic.parentSnapshotIds].sort();
  if (parentIds.join("\u0000") !== expectedIds.join("\u0000")) {
    throw new Error("Semantic delta parent ids do not match supplied parent snapshots");
  }
  if (new Set(parents.map((p) => p.worldLedgerId)).size !== 1) {
    throw new Error("Cannot combine representation snapshots from different world ledgers");
  }

  let viewKeys: string[];
  let observationKeys: string[];
  let complexity: number;
  let scope: readonly string[] | "*" = candidate.scopeTargetIds;

  if (semantic.kind === "REFINE") {
    const parent = parents[0];
    viewKeys = uniqueSorted([...parent.viewKeys, ...semantic.addViewKeys]);
    observationKeys = [...parent.observationKeys];
    complexity = parent.complexity + semantic.addViewKeys.length;
    scope = candidate.scopeTargetIds;
  } else if (semantic.kind === "QUOTIENT") {
    const parent = parents[0];
    const remove = new Set(semantic.removeViewKeys);
    viewKeys = parent.viewKeys.filter((key) => !remove.has(key));
    observationKeys = [...parent.observationKeys];
    complexity = Math.max(0, parent.complexity - semantic.removeViewKeys.length);
    // Quotients are intentionally target scoped; do not inherit global scope.
    scope = candidate.scopeTargetIds;
  } else if (semantic.kind === "OBSERVE") {
    const parent = parents[0];
    viewKeys = [...parent.viewKeys];
    observationKeys = uniqueSorted([...parent.observationKeys, ...semantic.addObservationKeys]);
    complexity = parent.complexity + semantic.addObservationKeys.length;
    scope = candidate.scopeTargetIds;
  } else {
    const [left, right] = parents;
    viewKeys = uniqueSorted([...left.viewKeys, ...right.viewKeys]);
    observationKeys = uniqueSorted([...left.observationKeys, ...right.observationKeys]);
    complexity = new Set([...viewKeys, ...observationKeys]).size;
    scope = candidate.scopeTargetIds;
  }

  const core = {
    id: `R-${candidate.candidateHash.slice(0, 12)}`,
    label: `${semantic.kind}:${candidate.id}`,
    worldLedgerId: parents[0].worldLedgerId,
    parentSnapshotIds: Object.freeze(parentIds),
    viewKeys: Object.freeze(uniqueSorted(viewKeys)),
    observationKeys: Object.freeze(uniqueSorted(observationKeys)),
    scopeTargetIds: scope,
    complexity,
    admissionRecordHash: admission.admissionRecordHash,
  } as const;
  // The snapshot id is bound to the candidate hash, while admissionRecordHash
  // binds the separate external review projection.
  return Object.freeze(core);
}

export class RepresentationRegistry {
  readonly #snapshots = new Map<string, RepresentationSnapshot>();

  constructor(rootSnapshots: readonly RepresentationSnapshot[]) {
    for (const snapshot of rootSnapshots) {
      if (snapshot.admissionRecordHash !== null) {
        throw new Error("Root snapshots must be designer-supplied roots with null admissionRecordHash");
      }
      this.#snapshots.set(snapshot.id, snapshot);
    }
  }

  size(): number {
    return this.#snapshots.size;
  }

  list(): RepresentationSnapshot[] {
    return [...this.#snapshots.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  get(id: string): RepresentationSnapshot | undefined {
    return this.#snapshots.get(id);
  }

  admit(candidate: CandidateDelta, admission: AdmissionRecord): RepresentationSnapshot {
    if (admission.projection.decision !== "admit") {
      throw new Error("Rejected candidate cannot enter the representation registry");
    }
    if (admission.projection.candidateHash !== candidate.candidateHash) {
      throw new Error("Admission record does not match candidate hash");
    }
    const parents = candidate.semantic.parentSnapshotIds.map((id) => {
      const snapshot = this.#snapshots.get(id);
      if (!snapshot) throw new Error(`Unknown parent snapshot: ${id}`);
      return snapshot;
    });
    const snapshot = buildSnapshot(candidate, admission, parents);
    const existing = this.#snapshots.get(snapshot.id);
    if (existing) return existing;
    this.#snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }
}

export function createRootSnapshot(input: {
  id: string;
  label: string;
  worldLedgerId: string;
  viewKeys: readonly string[];
  observationKeys?: readonly string[];
  scopeTargetIds?: readonly string[] | "*";
  complexity?: number;
}): RepresentationSnapshot {
  const viewKeys = uniqueSorted(input.viewKeys);
  const observationKeys = uniqueSorted(input.observationKeys ?? []);
  return Object.freeze({
    id: input.id,
    label: input.label,
    worldLedgerId: input.worldLedgerId,
    parentSnapshotIds: Object.freeze([]),
    viewKeys: Object.freeze(viewKeys),
    observationKeys: Object.freeze(observationKeys),
    scopeTargetIds:
      input.scopeTargetIds === undefined || input.scopeTargetIds === "*"
        ? "*"
        : Object.freeze(uniqueSorted(input.scopeTargetIds)),
    complexity: input.complexity ?? new Set([...viewKeys, ...observationKeys]).size,
    admissionRecordHash: null,
  });
}
