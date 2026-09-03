import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import {
  canonicalUnsigned,
  isProposalApproved,
  lastReceiptParents,
  RECEIPT_SCHEMA,
} from "../src/lib/agent/receipts.ts";
import { emitProposal, emitReceipt, hashText, makeReceipt } from "../src/lib/agent/receipts.server.ts";
import { runFlmDemo } from "../src/lib/agent/flm/demo.server.ts";

const FROZEN = {
  id: "rcpt-test-1",
  kind: "context",
  runId: "run-test-1",
  producer: "guided-retrieve",
  createdAt: 1755754800000,
  parentReceiptIds: [],
  provenance: ["language-tower:bm25-rerank"],
  payload: {
    type: "context",
    docIds: ["doc-a"],
    titles: ["A"],
    backend: "bm25-rerank",
  },
};

const FROZEN_HASH = "edd50c8bc9cb4bd7d6ee3d5b3fab3fbf666a5f96016f937fe91a5f5febda9e6b";

describe("guided-receipt/1", () => {
  it("binds SHA-256 to the canonical body excluding hash", () => {
    const rec = makeReceipt(FROZEN);
    assert.equal(rec.schemaVersion, RECEIPT_SCHEMA);
    assert.equal(rec.hash.length, 64);
    const expected = createHash("sha256").update(canonicalUnsigned(FROZEN)).digest("hex");
    assert.equal(rec.hash, expected);
    assert.equal(rec.hash, FROZEN_HASH);
    assert.ok(!canonicalUnsigned(FROZEN).includes('"hash"'));
  });

  it("changes hash when payload changes", () => {
    const a = makeReceipt(FROZEN);
    const b = makeReceipt({
      ...FROZEN,
      payload: { ...FROZEN.payload, titles: ["B"] },
    });
    assert.notEqual(a.hash, b.hash);
  });

  it("chains execution and verification onto the latest parent", () => {
    const receipts = [];
    emitReceipt(receipts, FROZEN);
    emitReceipt(receipts, {
      id: "rcpt-exec-1",
      kind: "execution",
      runId: "run-test-1",
      producer: "guided-tools",
      createdAt: 1755754801000,
      provenance: ["tool:sandbox"],
      payload: {
        type: "execution",
        capability: "sandbox",
        ok: true,
        outputPreview: "42",
        outputHash: hashText("42"),
      },
    });
    emitReceipt(receipts, {
      id: "rcpt-ver-1",
      kind: "verification",
      runId: "run-test-1",
      producer: "guided-verifier",
      createdAt: 1755754802000,
      provenance: ["local-verifier"],
      payload: {
        type: "verification",
        pass: true,
        reason: "Answer present and confidence above threshold",
        confidence: 0.8,
      },
    });
    assert.equal(receipts.length, 3);
    assert.deepEqual(receipts[1].parentReceiptIds, [receipts[0].id]);
    assert.deepEqual(receipts[2].parentReceiptIds, [receipts[1].id]);
    assert.deepEqual(lastReceiptParents(receipts), [receipts[2].id]);
  });

  it("does not treat a receipt hash as a Core artifact hash", () => {
    const rec = makeReceipt(FROZEN);
    assert.match(rec.schemaVersion, /^guided-receipt\//);
    assert.equal(rec.producer.startsWith("guided-"), true);
  });

  it("records a proposal without approving it", () => {
    const receipts = [];
    emitReceipt(receipts, FROZEN);
    const proposal = emitProposal(receipts, {
      id: "rcpt-prop-1",
      runId: "run-test-1",
      producer: "guided-student",
      createdAt: 1755754800500,
      provenance: ["student:test"],
      summary: "use sandbox for the compound interest",
      action: "tool",
      role: "student",
    });
    assert.equal(proposal.kind, "proposal");
    assert.equal(proposal.payload.type, "proposal");
    if (proposal.payload.type !== "proposal") throw new Error("narrow");
    assert.equal(proposal.payload.coreApproved, false);
    assert.equal(isProposalApproved(proposal.payload), false);
    assert.deepEqual(proposal.parentReceiptIds, [receipts[0].id]);
    const approved = emitProposal(receipts, {
      id: "rcpt-prop-2",
      runId: "run-test-1",
      producer: "guided-teacher",
      createdAt: 1755754800600,
      provenance: ["teacher:test"],
      summary: "governed plan text",
      action: "plan",
      role: "teacher",
    });
    if (approved.payload.type !== "proposal") throw new Error("narrow");
    assert.equal(approved.payload.coreApproved, false);
    assert.equal(approved.payload.action, "plan");
  });

  it("binds FLM candidates to a local proposal that is not Core admission", () => {
    const refine = runFlmDemo("refine");
    assert.equal(refine.receipts.length, 1);
    assert.equal(refine.receipts[0].kind, "proposal");
    assert.equal(refine.receipts[0].payload.type, "proposal");
    if (refine.receipts[0].payload.type !== "proposal") throw new Error("narrow");
    assert.equal(refine.receipts[0].payload.coreApproved, false);
    assert.equal(refine.receipts[0].payload.role, "local");
    assert.equal(refine.receipts[0].payload.candidateHash, refine.candidateHash);
    assert.equal(refine.coreAdmission, false);
    const blocked = runFlmDemo("self_review");
    assert.equal(blocked.selfReviewBlocked, true);
    assert.equal(blocked.receipts[0].kind, "proposal");
    if (blocked.receipts[0].payload.type !== "proposal") throw new Error("narrow");
    assert.equal(blocked.receipts[0].payload.coreApproved, false);
    assert.equal(
      blocked.receipts.some((r) => r.kind === "admission"),
      false,
    );
  });
});
