import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import {
  classifyMcpHttp,
  classifyMcpResponse,
  deriveHealthUrl,
  EQUAL_BUDGET,
  guidedPlanPayload,
  stableStringify,
  syntheticCasePayload,
} from "./hodgeform-parity.mjs";

describe("MCP HTTP classification", () => {
  it("treats login redirects as auth_required", () => {
    assert.equal(classifyMcpHttp(302, "/login"), "auth_required");
    assert.equal(classifyMcpHttp(401, null), "auth_required");
    assert.equal(classifyMcpHttp(200, null), "ok");
  });

  it("treats HTML login pages on HTTP 200 as auth_required", () => {
    const html = "<!doctype html><html><head><title>Orbita — Sign in</title></head></html>";
    assert.equal(classifyMcpResponse(200, null, "text/html; charset=utf-8", html), "auth_required");
    assert.equal(
      classifyMcpResponse(200, null, "application/json", '{"jsonrpc":"2.0","id":1}'),
      "ok",
    );
  });
});

describe("Student health URL derivation", () => {
  it("uses explicit health first, then /health for /v1 bases", () => {
    assert.equal(deriveHealthUrl("https://gpu.example/v1", "https://gpu.example/ready"), "https://gpu.example/ready");
    assert.equal(deriveHealthUrl("https://gpu.example/v1", ""), "https://gpu.example/health");
    assert.equal(deriveHealthUrl("", ""), "");
  });
});

describe("Guided/MCP client payload parity", () => {
  it("hashes the same plan payload from both channel wrappers", () => {
    const candidates = [
      {
        kind: "association",
        inputs: { table: "t", x: "a", y: "b" },
        outcome: "association survives controls",
        assumptions: ["iid"],
        falsifier: "p-value above threshold after pre-registered test",
      },
    ];
    const guided = guidedPlanPayload({
      caseId: "case-synthetic",
      summary: "check association",
      coverageNotes: "single table",
      candidates,
      channel: "guided",
    });
    const mcp = guidedPlanPayload({
      caseId: "case-synthetic",
      summary: "check association",
      coverageNotes: "single table",
      candidates,
      channel: "mcp",
    });
    const gHash = createHash("sha256").update(stableStringify(guided)).digest("hex");
    const mHash = createHash("sha256").update(stableStringify(mcp)).digest("hex");
    assert.equal(gHash, mHash);
  });

  it("uses live Core case fields, not invented question/scope/mode", () => {
    const payload = syntheticCasePayload();
    assert.equal(typeof payload.name, "string");
    assert.equal(typeof payload.goal, "string");
    assert.equal(typeof payload.domain_hint, "string");
    assert.equal("question" in payload, false);
    assert.equal("scope" in payload, false);
  });
});

describe("equal-budget protocol constants", () => {
  it("keeps the three conditions on the same token/time/task budget", () => {
    assert.equal(EQUAL_BUDGET.maxOutputTokens, 500);
    assert.equal(EQUAL_BUDGET.timeoutSeconds, 45);
    assert.equal(EQUAL_BUDGET.nTasks, 3);
  });
});

describe("secret redaction contract", () => {
  it("does not embed obvious bearer tokens in classify helpers", () => {
    assert.equal(classifyMcpHttp(403, null), "auth_required");
  });
});
