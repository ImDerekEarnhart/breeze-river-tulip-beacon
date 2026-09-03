import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diagnoseSuite, diagnoseWorld } from "../src/lib/agent/tower/fibers.ts";
import { LOCAL_FIBER_WORLDS } from "../src/lib/agent/tower/worlds.ts";
import {
  CORE_LANGUAGE_ADAPTERS,
  GOVERNED_PIPELINE,
  SUPERINTELLIGENCE_STAGES,
} from "../src/lib/agent/tower/pipeline.ts";
import { localLanguageSnapshot } from "../src/lib/agent/tower/snapshot.ts";

describe("local fiber auditor", () => {
  const suite = diagnoseSuite(LOCAL_FIBER_WORLDS);

  it("classifies all six designer-supplied worlds", () => {
    assert.equal(LOCAL_FIBER_WORLDS.length, 6);
    assert.equal(suite.statusAccuracy, 1);
    assert.equal(suite.falseHoles, 0);
    assert.equal(suite.missedHoles, 0);
    assert.equal(suite.languageLimitIssued, false);
  });

  it("never issues LANGUAGE_LIMIT or SEARCH_FAILURE", () => {
    for (const a of suite.audits) {
      assert.equal(a.languageLimitIssued, false);
      assert.equal(a.searchFailureIssued, false);
      assert.equal(a.scopeClaim, "finite_factorization_only");
    }
  });

  it("finds the SUM-GT coarse hole and singleton recoveries", () => {
    const a = diagnoseWorld(LOCAL_FIBER_WORLDS.find((w) => w.id === "SUM-GT"));
    assert.equal(a.status, "HOLE");
    assert.deepEqual(a.admittedRecoverySets, [["P1"], ["P2"]]);
    assert.ok(a.witnesses.length >= 1);
  });

  it("requires pair-only recovery on XOR-PAIR", () => {
    const a = diagnoseWorld(LOCAL_FIBER_WORLDS.find((w) => w.id === "XOR-PAIR"));
    assert.equal(a.status, "HOLE");
    assert.deepEqual(a.admittedRecoverySets, [["P1", "P2"]]);
  });

  it("restrains recovery on NO_HOLE worlds", () => {
    const ok = diagnoseWorld(LOCAL_FIBER_WORLDS.find((w) => w.id === "AB-OK"));
    const clock = diagnoseWorld(LOCAL_FIBER_WORLDS.find((w) => w.id === "CLOCK"));
    assert.equal(ok.status, "NO_HOLE");
    assert.deepEqual(ok.admittedRecoverySets, []);
    assert.equal(clock.status, "NO_HOLE");
    assert.deepEqual(clock.admittedRecoverySets, []);
    assert.ok(clock.overseparations.length > 0);
  });

  it("rejects target-derived leakage as recovery evidence", () => {
    const leak = diagnoseWorld(LOCAL_FIBER_WORLDS.find((w) => w.id === "LEAK-O"));
    assert.equal(leak.status, "HOLE");
    assert.equal(leak.provenance.P1, "target_derived");
    assert.ok(!leak.treatedAsGenuineNew.includes("P1"));
    assert.deepEqual(leak.admittedRecoverySets, [["P2", "P3"]]);
  });

  it("returns no recovery when the menu has no independent channel", () => {
    const none = diagnoseWorld(LOCAL_FIBER_WORLDS.find((w) => w.id === "NONE"));
    assert.equal(none.status, "HOLE");
    assert.deepEqual(none.admittedRecoverySets, []);
  });
});

describe("governed pipeline contract", () => {
  it("keeps Orbita as governor and the Tower unable to promote", () => {
    assert.equal(GOVERNED_PIPELINE[0].id, "orbita");
    assert.equal(GOVERNED_PIPELINE[1].id, "tower");
    assert.ok(GOVERNED_PIPELINE.some((s) => s.id === "flm" && s.status === "local_control"));
    const snap = localLanguageSnapshot();
    assert.equal(snap.promotion_enabled, false);
    assert.equal(snap.machine.not_the_tower_vm, true);
    assert.equal(snap.grammar.write_ops.length, 0);
    assert.ok(snap.primitive_registry.some((p) => p.symbol === "orb1_admit"));
    assert.ok(snap.primitive_registry.some((p) => p.symbol === "flm_audit"));
    assert.ok(snap.known_boundaries.some((b) => /coefficient-ring/i.test(b)));
    assert.ok(snap.known_boundaries.some((b) => /Retrieval is not the Language Tower/i.test(b)));
    assert.ok(snap.known_boundaries.some((b) => /FLM candidate hashes are not Hodgeform Core/i.test(b)));
    assert.ok(snap.known_boundaries.some((b) => /quarantined, not on the fast path/i.test(b)));
    assert.ok(!snap.ignorance_queue.some((g) => g.kind === "LANGUAGE_LIMIT"));
    assert.equal(
      snap.ignorance_queue.find((g) => g.gap_id === "gap-symmetry-hunter")?.kind,
      "MISSING_OPERATOR",
    );
    assert.deepEqual(
      snap.local_fiber_worlds,
      LOCAL_FIBER_WORLDS.map((w) => w.id),
    );
  });

  it("refuses Stage I and lists Core adapters without inventing them", () => {
    const stageI = SUPERINTELLIGENCE_STAGES.find((s) => s.id === "I");
    assert.ok(stageI);
    assert.match(stageI.here, /refused/i);
    assert.ok(CORE_LANGUAGE_ADAPTERS.includes("orbita_build_language_limit_certificate"));
    assert.ok(CORE_LANGUAGE_ADAPTERS.every((n) => n.startsWith("orbita_")));
  });
});
