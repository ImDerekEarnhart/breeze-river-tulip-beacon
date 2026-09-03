export type Scalar = string | number | boolean | null;

export type WorldState = Readonly<{
  id: string;
  facts: Readonly<Record<string, Scalar>>;
}>;

export type WorldLedger = Readonly<{
  id: string;
  states: readonly WorldState[];
}>;

export type TargetContract = Readonly<{
  id: string;
  targetKey: string;
  protectedTargetKeys: readonly string[];
  allowedObservationKeys: readonly string[];
  maxRepresentationCost?: number;
}>;

export type RepresentationSnapshot = Readonly<{
  id: string;
  label: string;
  worldLedgerId: string;
  parentSnapshotIds: readonly string[];
  viewKeys: readonly string[];
  observationKeys: readonly string[];
  scopeTargetIds: readonly string[] | "*";
  complexity: number;
  admissionRecordHash: string | null;
}>;

export type DeltaKind = "REFINE" | "QUOTIENT" | "OBSERVE" | "MERGE";

export type RefineDeltaSpec = Readonly<{
  kind: "REFINE";
  parentSnapshotIds: readonly [string];
  addViewKeys: readonly string[];
}>;

export type QuotientDeltaSpec = Readonly<{
  kind: "QUOTIENT";
  parentSnapshotIds: readonly [string];
  removeViewKeys: readonly string[];
}>;

export type ObserveDeltaSpec = Readonly<{
  kind: "OBSERVE";
  parentSnapshotIds: readonly [string];
  addObservationKeys: readonly string[];
  executionRequested: false;
}>;

export type MergeDeltaSpec = Readonly<{
  kind: "MERGE";
  parentSnapshotIds: readonly [string, string];
  mergeStrategy: "union-visible-keys";
}>;

export type SemanticDeltaSpec =
  | RefineDeltaSpec
  | QuotientDeltaSpec
  | ObserveDeltaSpec
  | MergeDeltaSpec;

export type CandidateDelta = Readonly<{
  id: string;
  proposedBy: string;
  rationale: string;
  scopeTargetIds: readonly string[] | "*";
  semantic: SemanticDeltaSpec;
  candidateHash: string;
}>;

export type ExternalAdmissionProjection = Readonly<{
  candidateHash: string;
  decision: "admit" | "reject";
  authority: "hodgeform" | "human_reviewer";
  reviewer: string;
  reviewRef: string;
  evidenceHashes: readonly string[];
  limitations: readonly string[];
  reviewedAt: string;
}>;

export type AdmissionRecord = Readonly<{
  projection: ExternalAdmissionProjection;
  admissionRecordHash: string;
}>;

export type CollisionWitness = Readonly<{
  targetKey: string;
  representationKey: string;
  stateIds: readonly string[];
  targetValues: readonly Scalar[];
}>;

export type FiberAudit = Readonly<{
  snapshotId: string;
  targetContractId: string;
  visibleKeys: readonly string[];
  adequate: boolean;
  collisions: readonly CollisionWitness[];
}>;

export type NuisanceSplit = Readonly<{
  stateA: string;
  stateB: string;
  sameTargetValues: Readonly<Record<string, Scalar>>;
  representationA: string;
  representationB: string;
}>;

export type NuisanceAudit = Readonly<{
  snapshotId: string;
  targetContractId: string;
  splits: readonly NuisanceSplit[];
}>;

export type RepairCandidate = Readonly<{
  id: string;
  addKeys: readonly string[];
  provenance: "independent" | "representation_derived" | "target_derived";
}>;

export type SurvivorSet = Readonly<{
  targetContractId: string;
  snapshotId: string;
  survivorIds: readonly string[];
  rejectedIds: readonly string[];
  nonIdentifiable: boolean;
}>;

export type ProbeProposal = Readonly<{
  id: string;
  targetContractId: string;
  survivorIds: readonly string[];
  requestedObservationKeys: readonly string[];
  expectedDiscrimination: string;
  executionRequested: false;
}>;
