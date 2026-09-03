import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  HANDOFF_ADAPTERS,
  HANDOFF_OPTIONAL,
  HANDOFF_OVERLAY,
  HANDOFF_POLICY,
} from "../src/lib/agent/handoff.ts";
import { localLanguageSnapshot } from "../src/lib/agent/tower/snapshot.ts";

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const OVERLAY_HASHES = {
  "src/lib/agent/flm/README.md": "f3149d0defd1ab4eaccc1340d10a697f36ca3de9d2ea32d17213a5225904f3a9",
  "src/lib/agent/flm/admission.server.ts": "08ee37258e13d2253d210bca88bbffa55bf47bc2f38498c95e3474753f761e73",
  "src/lib/agent/flm/canonical.ts": "397a4dbb548c08464c1f4b86eb5a3e4ecca9bc601d81e39907d000d5d28e8793",
  "src/lib/agent/flm/delta.server.ts": "391a22733ecfa93019b793fd02b29754b1574506630b86759ee65f516153456e",
  "src/lib/agent/flm/hash.server.ts": "3d1cfae15bfccdf8a622b26f54ffa732cb5329ba9ec8a5e4b47ee397aa4e6d0e",
  "src/lib/agent/flm/identifiability.ts": "7d2e83e4eecd24f8c71246686c3c1c15940d80463782744e58fc4b8c680c327a",
  "src/lib/agent/flm/index.ts": "b8193b1c7dcc9d11b9025063db66098dc0e6a8200d1e00197a6321589de8cabb",
  "src/lib/agent/flm/ledger.ts": "6f6a8de4fd6e87181a68df68739557bc1417eacfeac17837e504a51f2ed7efb7",
  "src/lib/agent/flm/partition.ts": "8401fc431bb5f7ed2d2cd93faa9b47bbd5ccd1a0f2ee97e737c6e61e4071286c",
  "src/lib/agent/flm/probe.ts": "85d4c05ad6e1c7d17f6be065109a1187a392e60da7e21c1c1e679a48b20efd04",
  "src/lib/agent/flm/registry.server.ts": "4f16a3c5ba5bd2e7dd45e1668e66ef5894063c2a37b591afde21f5302ad9fbe9",
  "src/lib/agent/flm/router.ts": "59db21a741569dd4198384b2e2f434a01bb6c6a08fd84f0d2e361bf71ec7a080",
  "src/lib/agent/flm/server.ts": "5b4bce4152ffa2dd97c59e8f36a91d885d3f428af56151c56f95f76e2733bb9a",
  "src/lib/agent/flm/types.ts": "b703adb066fa8a350ead427c3398f0debfb3787c2ea52e63f66f07dd839ab8b4",
  "src/lib/agent/orb1/admit.ts": "4584375f47a9a93722d2b7b3055a76b5213ee8923be500a5e22e3b3d28c8fe28",
};

const ADAPTER_HASHES = {
  "src/lib/agent/hodgeform/mcp.server.ts": "02182ebbe666c6a875fa68af545d4e772cc6946aac61826f5950850b0559ba15",
  "src/lib/agent/hodgeform/oauth.server.ts": "82e6e30421c19b9d1fb7fa0de61e8339cfe7b9a760793bbe289be71b27d3d694",
  "src/lib/agent/hodgeform/protocol.ts": "bcaba33338bcab92e15d6bd174ec6dfd0d2e396cbe9a1d75cd7ebbfb1293cfba",
};

const OPTIONAL_HASHES = {
  "optional/arc_falsifier/arc_agent/representation.py":
    "cddd0ccedfc466bd38fc860c6cd8f83387e72e8693352643be4e1650ed5f36ca",
  "optional/orb1_python/orb1_step_zero_exact_check.py":
    "c511f762945346574d2b9704f045c0fdcccc600422d0d02b4edbccc655e5e76a",
  "optional/ha_ir/ha_ir_v02.py": "03265f643587e7a24b91dc8c7216aa2692d3d293febb64199473399f49756075",
  "optional/spectral_fiber_frozen/LOCAL_FROZEN_EXECUTION_MANIFEST.json":
    "54c3e2c3b4c03fffcc5766df9a8ad7255ad1f2e2da2fde0367c66f4eb22ce1f4",
};

describe("executable systems handoff", () => {
  it("keeps the package non-standalone and Core-free", () => {
    assert.equal(HANDOFF_POLICY.schema, "guided-executable-systems-handoff/1");
    assert.equal(HANDOFF_POLICY.standalone, false);
    assert.equal(HANDOFF_POLICY.containsHodgeformCore, false);
    assert.equal(HANDOFF_POLICY.restoreGuidedFirst, true);
    assert.equal(HANDOFF_POLICY.blindOverwrite, false);
    assert.equal(HANDOFF_POLICY.receiptsAreCoreApproval, false);
    assert.equal(HANDOFF_POLICY.optionalOnFastPath, false);
  });

  it("keeps overlay kernel files hash-identical to the handoff", () => {
    for (const [path, expected] of Object.entries(OVERLAY_HASHES)) {
      assert.equal(existsSync(path), true, path);
      assert.equal(sha256(path), expected, path);
    }
  });

  it("does not overwrite Hodgeform adapters", () => {
    for (const [path, expected] of Object.entries(ADAPTER_HASHES)) {
      assert.equal(sha256(path), expected, path);
    }
    assert.equal(HANDOFF_ADAPTERS[0].status, "inspected_not_overwritten");
    assert.equal(HANDOFF_ADAPTERS[0].wired, true);
  });

  it("lands optional plugins as unwired quarantined source", () => {
    assert.ok(HANDOFF_OPTIONAL.length >= 4);
    for (const item of HANDOFF_OPTIONAL) {
      assert.equal(item.wired, false, item.id);
      assert.equal(item.status, "quarantined", item.id);
      assert.equal(existsSync(item.path), true, item.path);
    }
    for (const [path, expected] of Object.entries(OPTIONAL_HASHES)) {
      assert.equal(sha256(path), expected, path);
    }
  });

  it("does not put optional plugins on the active tool path", () => {
    const tools = readFileSync("src/lib/agent/tools.ts", "utf8");
    assert.match(tools, /name: "flm_audit"/);
    assert.match(tools, /name: "orb1_admit"/);
    assert.doesNotMatch(tools, /arc_falsifier/);
    assert.doesNotMatch(tools, /ha_ir/);
    assert.doesNotMatch(tools, /spectral_fiber/);
    const banned = [
      "optional/arc_falsifier",
      "optional/ha_ir",
      "optional/spectral_fiber_frozen",
      "arc_agent",
      "ha_ir_v02",
    ];
    for (const file of [
      "src/lib/agent/tools.ts",
      "src/lib/agent/orchestrator.server.ts",
      "src/lib/agent/api.ts",
    ]) {
      const src = readFileSync(file, "utf8");
      for (const needle of banned) {
        assert.equal(src.includes(needle), false, `${file} imports ${needle}`);
      }
    }
  });

  it("keeps overlay modules live as local controls or interchange", () => {
    const ids = HANDOFF_OVERLAY.map((x) => x.id);
    assert.deepEqual(ids, ["flm", "orb1", "receipts", "tower"]);
    for (const item of HANDOFF_OVERLAY) {
      assert.equal(item.wired, true);
      assert.ok(item.status === "live_control" || item.status === "live_interchange");
    }
  });

  it("records optional quarantine on the local language snapshot", () => {
    const snap = localLanguageSnapshot();
    assert.ok(snap.known_boundaries.some((b) => /quarantined, not on the fast path/i.test(b)));
    assert.equal(snap.promotion_enabled, false);
  });
});
