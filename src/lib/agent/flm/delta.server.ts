import { uniqueSorted } from "./canonical.ts";
import { hashArtifact } from "./hash.server.ts";
import type {
  CandidateDelta,
  SemanticDeltaSpec,
} from "./types.ts";

function normalizeSemantic(semantic: SemanticDeltaSpec): SemanticDeltaSpec {
  switch (semantic.kind) {
    case "REFINE":
      return Object.freeze({
        kind: "REFINE",
        parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds]) as readonly [string],
        addViewKeys: Object.freeze(uniqueSorted(semantic.addViewKeys)),
      });
    case "QUOTIENT":
      return Object.freeze({
        kind: "QUOTIENT",
        parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds]) as readonly [string],
        removeViewKeys: Object.freeze(uniqueSorted(semantic.removeViewKeys)),
      });
    case "OBSERVE":
      return Object.freeze({
        kind: "OBSERVE",
        parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds]) as readonly [string],
        addObservationKeys: Object.freeze(uniqueSorted(semantic.addObservationKeys)),
        executionRequested: false,
      });
    case "MERGE":
      return Object.freeze({
        kind: "MERGE",
        parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds].sort()) as readonly [string, string],
        mergeStrategy: "union-visible-keys",
      });
  }
}

export function createCandidateDelta(input: {
  id: string;
  proposedBy: string;
  rationale: string;
  scopeTargetIds: readonly string[] | "*";
  semantic: SemanticDeltaSpec;
}): CandidateDelta {
  const semantic = normalizeSemantic(input.semantic);
  const core = {
    id: input.id,
    proposedBy: input.proposedBy,
    rationale: input.rationale,
    scopeTargetIds:
      input.scopeTargetIds === "*" ? "*" : Object.freeze(uniqueSorted(input.scopeTargetIds)),
    semantic,
  } as const;
  return Object.freeze({ ...core, candidateHash: hashArtifact(core) });
}
