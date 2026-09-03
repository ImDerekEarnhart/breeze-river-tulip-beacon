import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { admitOperator } from "../src/lib/agent/orb1/admit.ts";
import { eqFrac, frac, formatFrac } from "../src/lib/agent/orb1/frac.ts";
import { eqGQ, gq, isQiUnitCircle, mulGQ, GQ_I } from "../src/lib/agent/orb1/gaussian.ts";
import { pageFrac, PAGE_LIMIT } from "../src/lib/agent/orb1/page.ts";
import {
  leibnizHolds,
  mixedOrderExpected,
  runStepZero,
  translationRoundtrip,
  translationUnits,
  zeroFrequencyExpected,
} from "../src/lib/agent/orb1/ring.ts";
import {
  basisCos,
  basisSin,
  coordDerive,
  eqState,
  fromTerms,
  mulState,
  oneState,
} from "../src/lib/agent/orb1/state.ts";

describe("Q(i) exact arithmetic", () => {
  it("reduces fractions without floats", () => {
    assert.equal(formatFrac(frac(2, 4)), "1/2");
    assert.equal(formatFrac(frac(-6, -8)), "3/4");
    assert.ok(eqFrac(frac(1, 2), frac(2, 4)));
  });

  it("multiplies Gaussian rationals exactly", () => {
    assert.ok(eqGQ(mulGQ(GQ_I, GQ_I), gq(-1, 0)));
    const u = gq(frac(3, 5), frac(4, 5));
    assert.equal(isQiUnitCircle(u), true);
    assert.equal(isQiUnitCircle(gq(1, 1)), false);
  });
});

describe("ORB-1 admission gate", () => {
  it("admits D and exact translations on the Q(i) unit circle", () => {
    const d = admitOperator("D");
    const t = admitOperator("exact_translation");
    assert.equal(d.decision, "ADMIT");
    assert.equal(d.inQi, true);
    assert.equal(d.coreLanguageLimit, false);
    assert.equal(d.earned, false);
    assert.equal(t.decision, "ADMIT");
    assert.equal(t.scopeClaim, "coefficient_ring_only");
  });

  it("quarantines √2 and π/4 as coefficient-ring limits, not Core LANGUAGE_LIMIT", () => {
    const sqrt2 = admitOperator("physical_derivative_sqrt2");
    const pi4 = admitOperator("shift_pi_over_4");
    assert.equal(sqrt2.decision, "QUARANTINE");
    assert.equal(sqrt2.inQi, false);
    assert.equal(sqrt2.multiplierNeeded, "i*sqrt(2)*n");
    assert.equal(sqrt2.coreLanguageLimit, false);
    assert.equal(sqrt2.earned, false);
    assert.equal(pi4.decision, "QUARANTINE");
    assert.equal(pi4.phasorNeeded, "(1+i)/sqrt(2)");
    assert.equal(pi4.coreLanguageLimit, false);
    assert.equal(pi4.earned, false);
    assert.match(sqrt2.reason, /not a Hodgeform Core LANGUAGE_LIMIT/i);
  });
});

describe("ORB-1 ring laws", () => {
  it("keeps the archived trigonometric regressions", () => {
    const mixed = mulState(basisCos(1, 1), basisSin(2, 1));
    const sq = mulState(basisCos(1, 1), basisCos(1, 1));
    assert.equal(eqState(mixed, mixedOrderExpected()), true);
    assert.equal(eqState(sq, zeroFrequencyExpected()), true);
  });

  it("survives a local mulberry32 step-zero check", () => {
    const result = runStepZero({ seed: 20260819, n: 80, d: 2 });
    assert.equal(result.toleranceUsed, false);
    assert.equal(result.exactArithmetic, true);
    assert.equal(result.failureCount, 0);
    assert.equal(result.verdict, "SURVIVED_IMPLEMENTATION_FALSIFICATION");
  });

  it("obeys Leibniz for D_j and translation roundtrip on Q(i) units", () => {
    const f = fromTerms(2, [[[1, 0], gq(frac(1, 2), 0)], [[0, 1], gq(0, frac(1, 3))]]);
    const g = oneState(2);
    assert.equal(leibnizHolds(f, g, 0), true);
    assert.equal(eqState(coordDerive(oneState(2), 0), fromTerms(2, [])), true);
    const u = translationUnits()[0];
    assert.equal(translationRoundtrip(f, [u, u]), true);
  });
});

describe("16-bit paging simulation", () => {
  it("overflows at 2^15 and stays labeled a simulation", () => {
    const ok = pageFrac(frac(1, 2));
    const over = pageFrac(frac(PAGE_LIMIT, 1n));
    assert.equal(ok.status, "OK");
    assert.equal(over.status, "OVERFLOW");
    assert.equal(over.simulated, true);
    assert.equal(over.notARegisterMachine, true);
    assert.equal(over.notTheTowerVm, true);
  });
});

describe("Python attachment regression", () => {
  it("still reports SURVIVED_IMPLEMENTATION_FALSIFICATION", () => {
    const r = spawnSync("python3", ["attachments/orb1_step_zero_exact_check.py"], {
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
    const json = JSON.parse(r.stdout);
    assert.equal(json.verdict, "SURVIVED_IMPLEMENTATION_FALSIFICATION");
    assert.equal(json.failure_count, 0);
    assert.equal(json.tolerance_used, false);
  });
});
