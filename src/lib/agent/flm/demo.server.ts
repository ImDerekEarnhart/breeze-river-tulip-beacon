import { projectExternalAdmission } from "./admission.server.ts";
import { createCandidateDelta } from "./delta.server.ts";
import { hashArtifact } from "./hash.server.ts";
import { createWorldLedger, rawFact } from "./ledger.ts";
import { auditFibers, auditNuisanceSplits } from "./partition.ts";
import { createRootSnapshot, RepresentationRegistry } from "./registry.server.ts";
import { routeLeastAdequate } from "./router.ts";
import { emitProposal } from "../receipts.server.ts";
import type { ReceiptEnvelope } from "../receipts.ts";
import type { CandidateDelta, FiberAudit, RepresentationSnapshot } from "./types.ts";

export const FLM_DEMO_IDS = ["refine", "quotient", "route", "observe", "self_review"] as const;
export type FlmDemoId = (typeof FLM_DEMO_IDS)[number];

export type FlmDemoResult = {
  id: FlmDemoId;
  title: string;
  body: string;
  beforeAdequate: boolean | null;
  afterAdequate: boolean | null;
  ledgerMutated: false;
  coreLanguageLimit: false;
  coreAdmission: false;
  selfReviewBlocked: boolean;
  candidateHash?: string;
  viewKeys?: string[];
  selectedId?: string | null;
  collisions?: number;
  notes: string[];
  receipts: ReceiptEnvelope[];
};

function admit(candidate: CandidateDelta, reviewer = "reviewer-1") {
  return projectExternalAdmission(candidate, {
    candidateHash: candidate.candidateHash,
    decision: "admit",
    authority: "hodgeform",
    reviewer,
    reviewRef: "hodgeform://guided-local/flm/demo",
    evidenceHashes: ["evidence-b", "evidence-a"],
    limitations: ["finite exact world only", "local projection is not Core approval"],
    reviewedAt: "2026-08-21T20:00:00.000Z",
  });
}

function packAudit(audit: FiberAudit) {
  return { adequate: audit.adequate, collisions: audit.collisions.length };
}

const PROPOSAL_AT = Date.parse("2026-08-21T20:00:00.000Z");

function withProposal(demo: Omit<FlmDemoResult, "receipts">): FlmDemoResult {
  const receipts: ReceiptEnvelope[] = [];
  const action =
    demo.id === "self_review"
      ? "observe"
      : demo.id === "route"
        ? "route"
        : demo.id;
  emitProposal(receipts, {
    id: `rcpt-flm-${demo.id}`,
    runId: `flm-${demo.id}`,
    producer: "guided-flm",
    createdAt: PROPOSAL_AT,
    provenance: [`flm:${demo.id}`],
    summary: demo.body,
    candidateCount: 1,
    action,
    role: "local",
    candidateHash: demo.candidateHash,
  });
  return { ...demo, receipts };
}

export function runFlmDemo(id: string): FlmDemoResult {
  const key = (FLM_DEMO_IDS as readonly string[]).includes(id) ? (id as FlmDemoId) : "refine";
  if (key === "refine") return demoRefine();
  if (key === "quotient") return demoQuotient();
  if (key === "route") return demoRoute();
  if (key === "observe") return demoObserve();
  return demoSelfReview();
}

function demoRefine(): FlmDemoResult {
  const ledger = createWorldLedger("sum-world", [
    { id: "a", facts: { x: 0, y: 1, sum: 1, gt: 0 } },
    { id: "b", facts: { x: 1, y: 0, sum: 1, gt: 1 } },
    { id: "c", facts: { x: 1, y: 1, sum: 2, gt: 0 } },
  ]);
  const target = { id: "gt-target", targetKey: "gt", protectedTargetKeys: [], allowedObservationKeys: [] };
  const root = createRootSnapshot({ id: "R0", label: "sum only", worldLedgerId: ledger.id, viewKeys: ["sum"] });
  const before = auditFibers(ledger, root, target);
  const candidate = createCandidateDelta({
    id: "add-x",
    proposedBy: "model-A",
    rationale: "x separates the sum=1 target collision",
    scopeTargetIds: [target.id],
    semantic: { kind: "REFINE", parentSnapshotIds: [root.id], addViewKeys: ["x"] },
  });
  const registry = new RepresentationRegistry([root]);
  const sizeBefore = registry.size();
  const refined = registry.admit(candidate, admit(candidate));
  const after = auditFibers(ledger, refined, target);
  return withProposal({
    id: "refine",
    title: "REFINE",
    body: "Add visible key x. The sum=1 fiber collision on gt is gone. Candidate generation did not mutate the registry.",
    beforeAdequate: before.adequate,
    afterAdequate: after.adequate,
    ledgerMutated: false,
    coreLanguageLimit: false,
    coreAdmission: false,
    selfReviewBlocked: false,
    candidateHash: candidate.candidateHash,
    viewKeys: [...refined.viewKeys],
    notes: [
      `registry ${sizeBefore} → ${registry.size()}`,
      `collisions ${before.collisions.length} → ${after.collisions.length}`,
      packAudit(before).adequate === false && packAudit(after).adequate === true
        ? "partition refined"
        : "unexpected audit",
    ],
  });
}

function demoQuotient(): FlmDemoResult {
  const ledger = createWorldLedger("camera-world", [
    { id: "a", facts: { signal: 0, camera: "A", on: 0, cameraTarget: "A" } },
    { id: "b", facts: { signal: 0, camera: "B", on: 0, cameraTarget: "B" } },
    { id: "c", facts: { signal: 1, camera: "A", on: 1, cameraTarget: "A" } },
    { id: "d", facts: { signal: 1, camera: "B", on: 1, cameraTarget: "B" } },
  ]);
  const onTarget = { id: "on-target", targetKey: "on", protectedTargetKeys: [], allowedObservationKeys: [] };
  const cameraTarget = {
    id: "camera-target",
    targetKey: "cameraTarget",
    protectedTargetKeys: [],
    allowedObservationKeys: [],
  };
  const rich = createRootSnapshot({
    id: "R-rich",
    label: "signal+camera",
    worldLedgerId: ledger.id,
    viewKeys: ["signal", "camera"],
    complexity: 2,
  });
  const hashBefore = hashArtifact(ledger);
  const splits = auditNuisanceSplits(ledger, rich, onTarget).splits.length;
  const candidate = createCandidateDelta({
    id: "drop-camera-for-on",
    proposedBy: "model-A",
    rationale: "camera is nuisance for on/off target",
    scopeTargetIds: [onTarget.id],
    semantic: { kind: "QUOTIENT", parentSnapshotIds: [rich.id], removeViewKeys: ["camera"] },
  });
  const registry = new RepresentationRegistry([rich]);
  const quotient = registry.admit(candidate, admit(candidate));
  return withProposal({
    id: "quotient",
    title: "QUOTIENT",
    body: "Drop camera from the on-target view. Raw camera facts remain. Adequacy is target-scoped: on holds, camera identity does not.",
    beforeAdequate: true,
    afterAdequate: auditFibers(ledger, quotient, onTarget).adequate,
    ledgerMutated: false,
    coreLanguageLimit: false,
    coreAdmission: false,
    selfReviewBlocked: false,
    candidateHash: candidate.candidateHash,
    viewKeys: [...quotient.viewKeys],
    notes: [
      `nuisance splits before ${splits}`,
      `raw b.camera=${String(rawFact(ledger, "b", "camera"))}`,
      `ledger hash unchanged ${hashArtifact(ledger) === hashBefore}`,
      `camera target adequate=${auditFibers(ledger, quotient, cameraTarget).adequate}`,
    ],
  });
}

function demoRoute(): FlmDemoResult {
  const ledger = createWorldLedger("routing-world", [
    { id: "a", facts: { signal: 0, camera: "A", on: 0 } },
    { id: "b", facts: { signal: 0, camera: "B", on: 0 } },
    { id: "c", facts: { signal: 1, camera: "A", on: 1 } },
    { id: "d", facts: { signal: 1, camera: "B", on: 1 } },
  ]);
  const target = { id: "on-target", targetKey: "on", protectedTargetKeys: [], allowedObservationKeys: [] };
  const rich = createRootSnapshot({
    id: "R-rich",
    label: "rich",
    worldLedgerId: ledger.id,
    viewKeys: ["signal", "camera"],
    complexity: 2,
  });
  const signal = createRootSnapshot({
    id: "R-signal",
    label: "signal",
    worldLedgerId: ledger.id,
    viewKeys: ["signal"],
    complexity: 1,
  });
  const empty = createRootSnapshot({
    id: "R-empty",
    label: "empty",
    worldLedgerId: ledger.id,
    viewKeys: [],
    complexity: 0,
  });
  const decision = routeLeastAdequate(ledger, target, [rich, empty, signal]);
  return withProposal({
    id: "route",
    title: "Least adequate",
    body: "Route to the cheapest adequate snapshot, not the richest. Empty is inadequate. Signal beats signal+camera.",
    beforeAdequate: null,
    afterAdequate: decision.selected?.id === "R-signal",
    ledgerMutated: false,
    coreLanguageLimit: false,
    coreAdmission: false,
    selfReviewBlocked: false,
    selectedId: decision.selected?.id ?? null,
    viewKeys: decision.selected ? [...decision.selected.viewKeys] : [],
    notes: [`adequate=${decision.adequateSnapshotIds.join(",")}`],
  });
}

function demoObserve(): FlmDemoResult {
  const ledger = createWorldLedger("observe-world", [
    { id: "a", facts: { base: 0, sensor: 0, target: 0 } },
    { id: "b", facts: { base: 0, sensor: 1, target: 1 } },
  ]);
  const target = {
    id: "sensor-target",
    targetKey: "target",
    protectedTargetKeys: [],
    allowedObservationKeys: ["sensor"],
  };
  const root = createRootSnapshot({ id: "R0", label: "base", worldLedgerId: ledger.id, viewKeys: ["base"] });
  const before = auditFibers(ledger, root, target);
  const candidate = createCandidateDelta({
    id: "observe-sensor",
    proposedBy: "model-A",
    rationale: "sensor is an allowed missing observation",
    scopeTargetIds: [target.id],
    semantic: {
      kind: "OBSERVE",
      parentSnapshotIds: [root.id],
      addObservationKeys: ["sensor"],
      executionRequested: false,
    },
  });
  const registry = new RepresentationRegistry([root]);
  const observed = registry.admit(candidate, admit(candidate));
  const after = auditFibers(ledger, observed, target);
  return withProposal({
    id: "observe",
    title: "OBSERVE",
    body: "Admit an allowed observation channel as a view. This kernel never executes the observation.",
    beforeAdequate: before.adequate,
    afterAdequate: after.adequate,
    ledgerMutated: false,
    coreLanguageLimit: false,
    coreAdmission: false,
    selfReviewBlocked: false,
    candidateHash: candidate.candidateHash,
    viewKeys: [...observed.observationKeys],
    notes: [
      `executionRequested=${candidate.semantic.kind === "OBSERVE" ? candidate.semantic.executionRequested : "n/a"}`,
      `observationKeys=${observed.observationKeys.join(",")}`,
    ],
  });
}

function demoSelfReview(): FlmDemoResult {
  const root: RepresentationSnapshot = createRootSnapshot({
    id: "R0",
    label: "base",
    worldLedgerId: "observe-world",
    viewKeys: ["base"],
  });
  const candidate = createCandidateDelta({
    id: "observe-z",
    proposedBy: "model-A",
    rationale: "request a missing admissible channel",
    scopeTargetIds: ["target-z"],
    semantic: {
      kind: "OBSERVE",
      parentSnapshotIds: [root.id],
      addObservationKeys: ["z"],
      executionRequested: false,
    },
  });
  let blocked = false;
  let note = "";
  try {
    admit(candidate, "model-A");
    note = "self-review unexpectedly succeeded";
  } catch (e) {
    blocked = /self-review/i.test(e instanceof Error ? e.message : String(e));
    note = e instanceof Error ? e.message : String(e);
  }
  return withProposal({
    id: "self_review",
    title: "No self-review",
    body: "The proposer cannot admit its own candidate. Local projection is not Hodgeform Core approval.",
    beforeAdequate: null,
    afterAdequate: null,
    ledgerMutated: false,
    coreLanguageLimit: false,
    coreAdmission: false,
    selfReviewBlocked: blocked,
    candidateHash: candidate.candidateHash,
    notes: [note],
  });
}
