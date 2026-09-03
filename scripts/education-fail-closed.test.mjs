import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { studentOnlyExamGate } from "../src/lib/agent/education/gate.ts";

describe("student-only exam fail-closed", () => {
  it("fail-closes when the student is unconfigured", () => {
    const g = studentOnlyExamGate(false);
    assert.equal(g.path, "fail_closed");
    assert.equal(g.reason, "student_unconfigured");
    assert.equal(g.teacherSubstituted, false);
    assert.equal("teacher" in g, false);
  });

  it("passes through to the student when configured", () => {
    const g = studentOnlyExamGate(true);
    assert.equal(g.path, "student");
    assert.equal(g.reason, "fast_path");
    assert.equal(g.teacherSubstituted, false);
  });

  it("does not call the teacher from the exam runner", () => {
    const src = readFileSync(
      new URL("../src/lib/agent/education/runner.server.ts", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(src, /teacherChat/);
    assert.doesNotMatch(src, /teacherProvider/);
    assert.match(src, /teacherSubstituted: false/);
  });

  it("never derives STUDENT_BASE_URL from XAI_API_KEY", () => {
    const src = readFileSync(
      new URL("../src/lib/agent/providers/config.server.ts", import.meta.url),
      "utf8",
    );
    assert.match(src, /role === "student"[\s\S]*\? explicitUrl/);
    const studentBranch = src.slice(src.indexOf("role === \"student\""));
    const firstTernary = studentBranch.slice(0, studentBranch.indexOf(";"));
    assert.doesNotMatch(firstTernary, /XAI_API_KEY/);
  });
});
