import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectExternalAdmission } from "../src/lib/agent/flm/admission.server.ts";
import { createCandidateDelta } from "../src/lib/agent/flm/delta.server.ts";
import { hashArtifact } from "../src/lib/agent/flm/hash.server.ts";
import { evaluateRepairSurvivors } from "../src/lib/agent/flm/identifiability.ts";
import { createWorldLedger, rawFact } from "../src/lib/agent/flm/ledger.ts";
import { auditFibers, auditNuisanceSplits, isPartitionRefinement } from "../src/lib/agent/flm/partition.ts";
import { proposeDiscriminatingProbe } from "../src/lib/agent/flm/probe.ts";
import { createRootSnapshot, RepresentationRegistry } from "../src/lib/agent/flm/registry.server.ts";
import { routeLeastAdequate } from "../src/lib/agent/flm/router.ts";
import { runFlmDemo } from "../src/lib/agent/flm/demo.server.ts";

function admission(candidate, reviewer = "reviewer-1") {
  return projectExternalAdmission(candidate, {
    candidateHash: candidate.candidateHash,
    decision: "admit",
    authority: "hodgeform",
    reviewer,
    reviewRef: "hodgeform://case/demo/review/1",
    evidenceHashes: ["evidence-b", "evidence-a"],
    limitations: ["finite exact world only"],
    reviewedAt: "2026-08-21T20:00:00.000Z",
  });
}

describe("Fiber Lattice Machine finite kernel", () => {
  it("REFINE removes an exact coarse-hole collision and refines the partition", () => {
    const ledger = createWorldLedger("sum-world", [
      { id: "a", facts: { x: 0, y: 1, sum: 1, gt: 0 } },
      { id: "b", facts: { x: 1, y: 0, sum: 1, gt: 1 } },
      { id: "c", facts: { x: 1, y: 1, sum: 2, gt: 0 } },
    ]);
    const target = { id: "gt-target", targetKey: "gt", protectedTargetKeys: [], allowedObservationKeys: [] };
    const root = createRootSnapshot({ id: "R0", label: "sum only", worldLedgerId: ledger.id, viewKeys: ["sum"] });
    assert.equal(auditFibers(ledger, root, target).adequate, false);

    const candidate = createCandidateDelta({
      id: "add-x",
      proposedBy: "model-A",
      rationale: "x separates the sum=1 target collision",
      scopeTargetIds: [target.id],
      semantic: { kind: "REFINE", parentSnapshotIds: [root.id], addViewKeys: ["x"] },
    });
    const registry = new RepresentationRegistry([root]);
    const before = registry.size();
    assert.equal(before, 1, "candidate generation must not mutate registry");
    const refined = registry.admit(candidate, admission(candidate));

    assert.equal(auditFibers(ledger, refined, target).adequate, true);
    assert.equal(isPartitionRefinement(ledger, refined, root), true);
    assert.equal(registry.size(), 2);
  });

  it("QUOTIENT compresses a target-scoped view without deleting raw evidence", () => {
    const ledger = createWorldLedger("camera-world", [
      { id: "a", facts: { signal: 0, camera: "A", on: 0, cameraTarget: "A" } },
      { id: "b", facts: { signal: 0, camera: "B", on: 0, cameraTarget: "B" } },
      { id: "c", facts: { signal: 1, camera: "A", on: 1, cameraTarget: "A" } },
      { id: "d", facts: { signal: 1, camera: "B", on: 1, cameraTarget: "B" } },
    ]);
    const onTarget = { id: "on-target", targetKey: "on", protectedTargetKeys: [], allowedObservationKeys: [] };
    const cameraTarget = { id: "camera-target", targetKey: "cameraTarget", protectedTargetKeys: [], allowedObservationKeys: [] };
    const rich = createRootSnapshot({
      id: "R-rich",
      label: "signal+camera",
      worldLedgerId: ledger.id,
      viewKeys: ["signal", "camera"],
      complexity: 2,
    });
    assert.ok(auditNuisanceSplits(ledger, rich, onTarget).splits.length > 0);
    const beforeLedgerHash = hashArtifact(ledger);

    const candidate = createCandidateDelta({
      id: "drop-camera-for-on",
      proposedBy: "model-A",
      rationale: "camera is nuisance for on/off target",
      scopeTargetIds: [onTarget.id],
      semantic: { kind: "QUOTIENT", parentSnapshotIds: [rich.id], removeViewKeys: ["camera"] },
    });
    const registry = new RepresentationRegistry([rich]);
    const quotient = registry.admit(candidate, admission(candidate));

    assert.deepEqual(quotient.viewKeys, ["signal"]);
    assert.equal(quotient.complexity, 1);
    assert.equal(auditFibers(ledger, quotient, onTarget).adequate, true);
    assert.equal(auditFibers(ledger, quotient, cameraTarget).adequate, false);
    assert.equal(rawFact(ledger, "b", "camera"), "B");
    assert.equal(hashArtifact(ledger), beforeLedgerHash, "quotient must not mutate raw ledger");
    assert.deepEqual(quotient.scopeTargetIds, [onTarget.id]);
  });

  it("retains non-identifiable repairs until a discriminating observation narrows them", () => {
    const discovery = createWorldLedger("repair-world", [
      { id: "d0", facts: { base: 0, target: 0, p: 0, q: 0 } },
      { id: "d1", facts: { base: 0, target: 1, p: 1, q: 1 } },
    ]);
    const target = {
      id: "repair-target",
      targetKey: "target",
      protectedTargetKeys: [],
      allowedObservationKeys: ["probe"],
    };
    const root = createRootSnapshot({ id: "R0", label: "base", worldLedgerId: discovery.id, viewKeys: ["base"] });
    const candidates = [
      { id: "P", addKeys: ["p"], provenance: "independent" },
      { id: "Q", addKeys: ["q"], provenance: "independent" },
      { id: "LEAK", addKeys: ["target"], provenance: "target_derived" },
    ];
    const first = evaluateRepairSurvivors(discovery, root, target, candidates);
    assert.deepEqual(first.survivorIds, ["P", "Q"]);
    assert.equal(first.nonIdentifiable, true);
    assert.ok(first.rejectedIds.includes("LEAK"));

    const probe = proposeDiscriminatingProbe({
      id: "probe-p-v-q",
      contract: target,
      survivors: first,
      requestedObservationKeys: ["probe"],
      expectedDiscrimination: "seek a case where p and q disagree before choosing a repair",
    });
    assert.equal(probe.executionRequested, false);

    const expanded = createWorldLedger("repair-world", [
      ...discovery.states.map((state) => ({ id: state.id, facts: { ...state.facts } })),
      { id: "probe0", facts: { base: 0, target: 0, p: 0, q: 1, probe: 1 } },
    ]);
    const narrowed = evaluateRepairSurvivors(expanded, root, target, candidates);
    assert.deepEqual(narrowed.survivorIds, ["P"]);
    assert.equal(narrowed.nonIdentifiable, false);
  });

  it("routes to the least adequate admitted representation rather than the richest", () => {
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
    assert.equal(decision.selected?.id, "R-signal");
    assert.deepEqual(decision.adequateSnapshotIds, ["R-signal", "R-rich"]);
  });

  it("binds candidates and external admission projections to exact hashes", () => {
    assert.equal(hashArtifact({ b: 2, a: 1 }), hashArtifact({ a: 1, b: 2 }));
    assert.notEqual(hashArtifact({ a: 1 }), hashArtifact({ a: 2 }));

    const candidate = createCandidateDelta({
      id: "observe-z",
      proposedBy: "model-A",
      rationale: "request a missing admissible channel",
      scopeTargetIds: ["target-z"],
      semantic: { kind: "OBSERVE", parentSnapshotIds: ["R0"], addObservationKeys: ["z"], executionRequested: false },
    });
    assert.throws(
      () => projectExternalAdmission(candidate, {
        candidateHash: "deadbeef",
        decision: "admit",
        authority: "hodgeform",
        reviewer: "reviewer-1",
        reviewRef: "review://wrong-hash",
        evidenceHashes: [],
        limitations: [],
        reviewedAt: "2026-08-21T20:00:00.000Z",
      }),
      /exact candidate hash/i,
    );
    assert.throws(() => admission(candidate, "model-A"), /cannot self-review/i);
    const good = admission(candidate);
    assert.equal(good.projection.candidateHash, candidate.candidateHash);
    assert.equal(good.admissionRecordHash.length, 64);
  });

  it("OBSERVE adds an admitted observation channel but never requests execution", () => {
    const ledger = createWorldLedger("observe-world", [
      { id: "a", facts: { base: 0, sensor: 0, target: 0 } },
      { id: "b", facts: { base: 0, sensor: 1, target: 1 } },
    ]);
    const target = { id: "sensor-target", targetKey: "target", protectedTargetKeys: [], allowedObservationKeys: ["sensor"] };
    const root = createRootSnapshot({ id: "R0", label: "base", worldLedgerId: ledger.id, viewKeys: ["base"] });
    const candidate = createCandidateDelta({
      id: "observe-sensor",
      proposedBy: "model-A",
      rationale: "sensor is an allowed missing observation",
      scopeTargetIds: [target.id],
      semantic: { kind: "OBSERVE", parentSnapshotIds: [root.id], addObservationKeys: ["sensor"], executionRequested: false },
    });
    assert.equal(candidate.semantic.executionRequested, false);
    const registry = new RepresentationRegistry([root]);
    const observed = registry.admit(candidate, admission(candidate));
    assert.deepEqual(observed.observationKeys, ["sensor"]);
    assert.deepEqual(observed.scopeTargetIds, [target.id]);
    assert.equal(auditFibers(ledger, observed, target).adequate, true);
  });

  it("MERGE v0 preserves both parent distinctions by exact union", () => {
    const ledger = createWorldLedger("merge-world", [
      { id: "a", facts: { x: 0, y: 0, target: 0 } },
      { id: "b", facts: { x: 1, y: 0, target: 1 } },
      { id: "c", facts: { x: 0, y: 1, target: 1 } },
    ]);
    const left = createRootSnapshot({ id: "R-x", label: "x", worldLedgerId: ledger.id, viewKeys: ["x"] });
    const right = createRootSnapshot({ id: "R-y", label: "y", worldLedgerId: ledger.id, viewKeys: ["y"] });
    const candidate = createCandidateDelta({
      id: "merge-x-y",
      proposedBy: "model-A",
      rationale: "retain both independently admitted distinctions",
      scopeTargetIds: ["xy-target"],
      semantic: { kind: "MERGE", parentSnapshotIds: [left.id, right.id], mergeStrategy: "union-visible-keys" },
    });
    const registry = new RepresentationRegistry([left, right]);
    const merged = registry.admit(candidate, admission(candidate));
    assert.deepEqual(merged.viewKeys, ["x", "y"]);
    assert.equal(isPartitionRefinement(ledger, merged, left), true);
    assert.equal(isPartitionRefinement(ledger, merged, right), true);
  });

  it("protects declared secondary targets from false adequacy", () => {
    const ledger = createWorldLedger("protected-world", [
      { id: "a", facts: { signal: 0, site: "A", on: 0, siteTarget: "A" } },
      { id: "b", facts: { signal: 0, site: "B", on: 0, siteTarget: "B" } },
    ]);
    const snapshot = createRootSnapshot({ id: "R-signal", label: "signal", worldLedgerId: ledger.id, viewKeys: ["signal"] });
    const contract = {
      id: "on-with-site-protected",
      targetKey: "on",
      protectedTargetKeys: ["siteTarget"],
      allowedObservationKeys: [],
    };
    const audit = auditFibers(ledger, snapshot, contract);
    assert.equal(audit.adequate, false);
    assert.equal(audit.collisions[0].targetKey, "siteTarget");
  });
});

describe("Guided FLM handoff wiring", () => {
  it("keeps demos fail-closed for Core claims and blocks self-review", () => {
    const refine = runFlmDemo("refine");
    assert.equal(refine.beforeAdequate, false);
    assert.equal(refine.afterAdequate, true);
    assert.equal(refine.ledgerMutated, false);
    assert.equal(refine.coreAdmission, false);
    assert.equal(refine.coreLanguageLimit, false);
    assert.equal(refine.receipts[0].kind, "proposal");
    assert.equal(refine.receipts[0].payload.type, "proposal");
    assert.equal(refine.receipts[0].payload.coreApproved, false);
    const blocked = runFlmDemo("self_review");
    assert.equal(blocked.selfReviewBlocked, true);
    const route = runFlmDemo("route");
    assert.equal(route.selectedId, "R-signal");
  });
});
