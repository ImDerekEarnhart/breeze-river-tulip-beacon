import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ARCH_NODES,
  ARCHITECTURE_LOOP,
  FALSIFIERS,
  NODE_COPY,
  POLICY_VERSION,
  RETRIEVE_PROVENANCE,
  RETRIEVE_STEP_TITLE,
  ROLE_AXIOMS,
  routeAfterVerify,
  routeWhenStudentMissing,
} from "../src/lib/agent/roles.ts";
import { localLanguageSnapshot } from "../src/lib/agent/tower/snapshot.ts";

describe("frozen architecture ontology", () => {
  it("keeps retrieval off the Tower and vLLM off the student", () => {
    assert.ok(ROLE_AXIOMS.includes("Language Tower ≠ RAG"));
    assert.ok(ROLE_AXIOMS.includes("vLLM ≠ student"));
    assert.ok(ROLE_AXIOMS.includes("Teacher ≠ fallback student"));
    assert.equal(RETRIEVE_STEP_TITLE, "Retrieval");
    assert.equal(RETRIEVE_PROVENANCE, "retrieval:bm25-rerank");
    assert.notEqual(RETRIEVE_STEP_TITLE, "Language tower");
  });

  it("does not light the Tower node on retrieve", () => {
    const tower = ARCH_NODES.find((n) => n.id === "tower");
    const retrieval = ARCH_NODES.find((n) => n.id === "retrieval");
    const student = ARCH_NODES.find((n) => n.id === "student");
    const vllm = ARCH_NODES.find((n) => n.id === "vllm");
    assert.ok(tower && retrieval && student && vllm);
    assert.ok(!tower.kinds.includes("retrieve"));
    assert.ok(retrieval.kinds.includes("retrieve"));
    assert.equal(tower.plane, "govern");
    assert.equal(retrieval.plane, "fast");
    assert.notEqual(student.label, vllm.label);
    assert.match(NODE_COPY.retrieval, /not the Language Tower/i);
    assert.match(NODE_COPY.teacher, /not a fallback/i);
  });

  it("fail-closes when the student is missing on the fast path", () => {
    const r = routeWhenStudentMissing("fast");
    assert.equal(r.path, "fail_closed");
    assert.equal(r.reason, "student_unconfigured");
    assert.equal(r.teacherSubstituted, false);
    assert.equal(r.policyVersion, POLICY_VERSION);
  });

  it("does not treat governed eligibility as silent substitution", () => {
    const r = routeWhenStudentMissing("governed");
    assert.equal(r.path, "teacher");
    assert.equal(r.reason, "governed_plan");
    assert.equal(r.teacherSubstituted, false);
  });

  it("tags teacher routes with an explicit reason", () => {
    const failed = routeAfterVerify({
      pass: false,
      action: "answer",
      confidence: 0.9,
      studentAttemptId: "run-1",
      studentModel: "test-slm",
    });
    assert.equal(failed.path, "teacher");
    assert.equal(failed.reason, "verification_failed");
    assert.equal(failed.teacherSubstituted, false);

    const asked = routeAfterVerify({
      pass: true,
      action: "escalate",
      confidence: 0.8,
      studentAttemptId: "run-1",
    });
    assert.equal(asked.reason, "student_requested");

    const ok = routeAfterVerify({
      pass: true,
      action: "answer",
      confidence: 0.8,
      studentAttemptId: "run-1",
    });
    assert.equal(ok.path, "student");
    assert.equal(ok.reason, "fast_path");
  });

  it("records the HodgeForm architecture loop as operator-chat, not app MCP", () => {
    assert.equal(ARCHITECTURE_LOOP.notFromAppMcp, true);
    assert.equal(ARCHITECTURE_LOOP.channel, "operator-chat");
    assert.equal(ARCHITECTURE_LOOP.caseId, "case_c79bed8f9bd34612");
    assert.equal(ARCHITECTURE_LOOP.loopId, "problem_loop_541ce2f1fac54e92");
    assert.equal(ARCHITECTURE_LOOP.state, "RETRY");
    assert.equal(ARCHITECTURE_LOOP.retryAuthorized, true);
    assert.equal(ARCHITECTURE_LOOP.diagnosedLimitation, "VERIFIER_LIMIT");
    assert.equal(ARCHITECTURE_LOOP.repairKind, "verifier");
    assert.equal(ARCHITECTURE_LOOP.candidateHash, "53f3b10fb903f3330152deefa2d885882ec4397252ad75145f8b88a3529c7449");
    assert.equal(ARCHITECTURE_LOOP.activationRequested, false);
    assert.equal(ARCHITECTURE_LOOP.coreApproved, false);
    assert.equal(ARCHITECTURE_LOOP.latestEventHash, "5c339c5dbc74b6c01900a0aafef4db0f7e7422cc42e3f4a123b60b1df12d5c23");
  });

  it("keeps frozen falsifiers and local snapshot promotion off", () => {
    const ids = FALSIFIERS.map((f) => f.id);
    assert.deepEqual(ids, [
      "tower_is_only_rag",
      "silent_teacher_substitution",
      "teacher_cost_no_gain",
      "retrieval_tower_coupled",
      "self_promotion",
      "unrestricted_shell",
    ]);
    assert.equal(FALSIFIERS.find((f) => f.id === "silent_teacher_substitution")?.localStatus, "survives");
    assert.equal(FALSIFIERS.find((f) => f.id === "teacher_cost_no_gain")?.localStatus, "blocked");
    const snap = localLanguageSnapshot();
    assert.equal(snap.promotion_enabled, false);
    assert.ok(snap.known_boundaries.some((b) => /Retrieval is not the Language Tower/i.test(b)));
    assert.equal(snap.machine.not_the_tower_vm, true);
  });
});
