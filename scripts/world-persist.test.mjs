import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyDeskBody,
  applyRun,
  applyTurn,
  applyVisit,
  migrateWorld,
  placeFromPath,
  seedWorld,
  WORLD_SCHEMA,
} from "../src/lib/world.ts";

describe("guided-world/1", () => {
  it("seeds all eight planes plus conversation and is not Core", () => {
    const w = seedWorld(1);
    assert.equal(w.schemaVersion, WORLD_SCHEMA);
    assert.equal(w.coreWorld, false);
    assert.ok(w.position.place);
    assert.ok(w.body);
    assert.ok(w.possessions.length >= 1);
    assert.ok(w.memories.length >= 1);
    assert.ok(w.relationships.some((r) => r.role === "student" && r.status === "unconfigured"));
    assert.ok(w.goals.every((g) => g.status === "blocked"));
    assert.equal(w.map.length, 7);
    assert.ok(w.events.length >= 1);
    assert.equal(w.conversation.turns.length, 0);
  });

  it("appends conversation turns onto the world and does not wipe them", () => {
    let w = seedWorld(1);
    w = applyTurn(
      w,
      { id: "u1", role: "user", content: "hello", runId: "", at: 1 },
      1,
    );
    w = applyTurn(
      w,
      { id: "a1", role: "assistant", content: "hi", runId: "r1", at: 2 },
      2,
    );
    assert.equal(w.conversation.turns.length, 2);
    assert.equal(w.conversation.turns[0].content, "hello");
    assert.equal(w.goals.length, seedWorld(1).goals.length);
    assert.equal(w.events[0].kind, "world_init");
  });

  it("migrates a snapshot that has no conversation field", () => {
    const raw = seedWorld(1);
    const { conversation: _drop, ...rest } = raw;
    const next = migrateWorld(rest);
    assert.ok(next.conversation);
    assert.equal(next.conversation.turns.length, 0);
    assert.equal(next.schemaVersion, WORLD_SCHEMA);
  });

  it("learns map rooms and records runs as events with optional receipt refs", () => {
    let w = seedWorld(1);
    w = applyVisit(w, "tower", 2);
    assert.equal(w.position.place, "tower");
    assert.equal(w.map.find((r) => r.id === "tower")?.visited, true);
    w = applyRun(
      w,
      {
        request: "Admit D on Q(i)",
        answer: "admitted",
        receiptHash: "abc123def456",
        memoryId: "epi-1",
        memoryKind: "episodic",
        memoryTitle: "Admit D",
      },
      3,
    );
    assert.equal(w.events[0].kind, "run");
    assert.equal(w.events[0].parentReceiptId, "abc123def456");
    assert.ok(w.possessions.some((p) => p.ref === "abc123def456"));
    assert.ok(w.memories.some((m) => m.id === "epi-1"));
    w = applyDeskBody(w, { deskStatus: "running", pointerX: 10, pointerY: 20 }, 4);
    assert.equal(w.body.deskStatus, "running");
    assert.equal(w.position.place, "desktop");
    assert.equal(placeFromPath("/memory"), "memory");
    assert.equal(placeFromPath("/"), "console");
  });
});
