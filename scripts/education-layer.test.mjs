import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  EDUCATION_FAILURE_KINDS,
  SMOKE_ITEMS,
  admitTeacherCorrection,
  matchSmokeItem,
  scoreAnswer,
  studentOnlyExamGate,
} from "../src/lib/agent/education/index.ts";
import { RETRY_ARTIFACT } from "../src/lib/agent/education/retry-artifact.ts";
import { ARCHITECTURE_LOOP } from "../src/lib/agent/roles.ts";
import { localLanguageSnapshot } from "../src/lib/agent/tower/snapshot.ts";

describe("local education layer", () => {
  it("never includes LANGUAGE_LIMIT in education failure kinds", () => {
    assert.ok(!EDUCATION_FAILURE_KINDS.includes("LANGUAGE_LIMIT"));
    assert.deepEqual([...EDUCATION_FAILURE_KINDS], [
      "MISSING_ANSWER",
      "WRONG_LABEL",
      "FORBIDDEN_LABEL",
    ]);
  });

  it("fails missing answers", () => {
    const item = SMOKE_ITEMS.find((s) => s.id === "who-student");
    const scored = scoreAnswer(" ", item, 0.99);
    assert.equal(scored.pass, false);
    assert.equal(scored.kind, "MISSING_ANSWER");
    assert.equal(scored.languageLimit, false);
  });

  it("fails high-confidence wrong labels", () => {
    const item = SMOKE_ITEMS.find((s) => s.id === "who-student");
    const grok = scoreAnswer("The student is Grok.", item, 0.95);
    assert.equal(grok.pass, false);
    assert.equal(grok.kind, "FORBIDDEN_LABEL");
    const wrong = scoreAnswer("The student is the orchestrator.", item, 0.95);
    assert.equal(wrong.pass, false);
    assert.equal(wrong.kind, "WRONG_LABEL");
    assert.match(wrong.reason, /High-confidence/);
    assert.equal(wrong.languageLimit, false);
  });

  it("passes an exact semantic label", () => {
    const item = SMOKE_ITEMS.find((s) => s.id === "who-student");
    const scored = scoreAnswer("The student is the GPU worker behind vLLM.", item, 0.7);
    assert.equal(scored.pass, true);
    assert.equal(scored.kind, null);
  });

  it("keeps unmatched teacher corrections quarantined", () => {
    const v = admitTeacherCorrection({
      prompt: "Summarize yesterday's weather in Philadelphia.",
      teacherAnswer: "It rained.",
    });
    assert.equal(v.status, "quarantined");
    assert.equal(v.educationPass, null);
    assert.equal(v.coreApproved, false);
    assert.equal(v.languageLimit, false);
  });

  it("local-passes a teacher answer that hits the smoke label", () => {
    const v = admitTeacherCorrection({
      prompt: "If the student is missing, what happens?",
      teacherAnswer: "The fast path fail-closed. Grok is not used as a fallback.",
      confidence: 0.9,
    });
    assert.equal(v.status, "local_pass");
    assert.equal(v.coreApproved, false);
    assert.match(v.reason, /not Hodgeform Core/i);
  });

  it("matches smoke prompts without treating them as LANGUAGE_LIMIT", () => {
    const item = matchSmokeItem("Is retrieval the Language Tower?");
    assert.equal(item?.id, "retrieval-not-tower");
    const miss = scoreAnswer("Yes, retrieval is the tower.", item, 0.9);
    assert.equal(miss.pass, false);
    assert.equal(miss.languageLimit, false);
  });
});

describe("RETRY artifact stays on disk", () => {
  it("names the Core keys and does not claim submission", () => {
    assert.equal(RETRY_ARTIFACT.submitted, false);
    assert.equal(RETRY_ARTIFACT.retry_authorized, true);
    assert.equal(RETRY_ARTIFACT.expected_state, "RETRY");
    assert.equal(RETRY_ARTIFACT.expected_previous_event_hash, ARCHITECTURE_LOOP.latestEventHash);
    assert.ok(RETRY_ARTIFACT.retained_falsifiers.includes("silent_teacher_substitution"));
    assert.equal(RETRY_ARTIFACT.activationRequested, false);
    assert.equal(RETRY_ARTIFACT.coreApproved, false);
    assert.match(RETRY_ARTIFACT.note, /not the SHA-256/i);
  });
});

describe("ignorance queue does not mislabel missing operators", () => {
  it("labels the Transformation Hunter as MISSING_OPERATOR", () => {
    const snap = localLanguageSnapshot();
    const hunter = snap.ignorance_queue.find((g) => g.gap_id === "gap-symmetry-hunter");
    assert.equal(hunter?.kind, "MISSING_OPERATOR");
    assert.ok(!snap.ignorance_queue.some((g) => g.kind === "LANGUAGE_LIMIT"));
    assert.ok(snap.known_boundaries.some((b) => /MISSING_OPERATOR, not LANGUAGE_LIMIT/i.test(b)));
  });
});

describe("exam runner source never calls the teacher", () => {
  it("has no teacher symbol", () => {
    const src = readFileSync(new URL("../src/lib/agent/education/runner.server.ts", import.meta.url), "utf8");
    assert.equal(/teacherChat|teacherProvider|teacherAvailable/.test(src), false);
    assert.match(src, /teacherCalled: false/);
    assert.match(src, /studentOnlyExamGate/);
  });
});
