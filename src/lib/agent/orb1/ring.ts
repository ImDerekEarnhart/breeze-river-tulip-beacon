import { frac } from "./frac.ts";
import { gq, isQiUnitCircle, type GQ } from "./gaussian.ts";
import {
  addState,
  basisCos,
  basisSin,
  coordDerive,
  emptyState,
  eqState,
  fromTerms,
  isRealState,
  mulState,
  negState,
  oneState,
  serial,
  subState,
  translate,
  type State,
} from "./state.ts";

export type StepZeroResult = {
  schema: "orb1-step-zero-exact-check/1";
  seed: number;
  randomRingCases: number;
  randomRealInvariantCases: number;
  coefficientDomain: "Gaussian rationals Q(i)";
  frequencyGroup: string;
  exactArithmetic: true;
  toleranceUsed: false;
  failureCount: number;
  failures: string[];
  mixedRegressionProduct: ReturnType<typeof serial>;
  zeroFrequencyRegressionProduct: ReturnType<typeof serial>;
  verdict: "SURVIVED_IMPLEMENTATION_FALSIFICATION" | "REFUTED";
  prng: "mulberry32";
  note: string;
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randint(r: () => number, lo: number, hi: number): number {
  return lo + Math.floor(r() * (hi - lo + 1));
}

function randGQ(r: () => number): GQ {
  return gq(frac(randint(r, -4, 4), randint(r, 1, 4)), frac(randint(r, -4, 4), randint(r, 1, 4)));
}

function randState(r: () => number, d: number, maxTerms = 6): State {
  const terms: [number[], GQ][] = [];
  const n = randint(r, 0, maxTerms);
  for (let i = 0; i < n; i += 1) {
    const k = Array.from({ length: d }, () => randint(r, -3, 3));
    terms.push([k, randGQ(r)]);
  }
  return fromTerms(d, terms);
}

function randRealState(r: () => number, d: number, maxPairs = 4): State {
  const terms: [number[], GQ][] = [
    [Array.from({ length: d }, () => 0), gq(frac(randint(r, -4, 4), randint(r, 1, 4)), 0)],
  ];
  const n = randint(r, 0, maxPairs);
  for (let i = 0; i < n; i += 1) {
    let k: number[] = [];
    let guard = 0;
    while (guard < 16 && (k.length === 0 || k.every((x) => x === 0))) {
      k = Array.from({ length: d }, () => randint(r, -3, 3));
      guard += 1;
    }
    const a = randGQ(r);
    const nk = k.map((x) => -x);
    terms.push([k, a]);
    terms.push([nk, { a: a.a, b: { n: -a.b.n, d: a.b.d } }]);
  }
  return fromTerms(d, terms);
}

function check(cond: boolean, name: string, failures: string[]): void {
  if (!cond) failures.push(name);
}

export function mixedOrderExpected(): State {
  return fromTerms(1, [
    [[3], gq(0, frac(-1, 4))],
    [[-3], gq(0, frac(1, 4))],
    [[1], gq(0, frac(-1, 4))],
    [[-1], gq(0, frac(1, 4))],
  ]);
}

export function zeroFrequencyExpected(): State {
  return fromTerms(1, [
    [[0], gq(frac(1, 2), 0)],
    [[2], gq(frac(1, 4), 0)],
    [[-2], gq(frac(1, 4), 0)],
  ]);
}

/**
 * Exact ring laws on Q(i)[Z^d]. Randomized cases use mulberry32, not Python
 * random.Random, so they will not bit-match the attachment seed stream.
 * The two archived trigonometric regressions are seed-free and must match.
 */
export function runStepZero(opts?: { seed?: number; n?: number; d?: number }): StepZeroResult {
  const seed = opts?.seed ?? 20260819;
  const N = opts?.n ?? 80;
  const d = opts?.d ?? 2;
  const r = mulberry32(seed);
  const fail: string[] = [];
  const Z = emptyState(d);
  const O = oneState(d);

  for (let i = 0; i < N; i += 1) {
    const a = randState(r, d);
    const b = randState(r, d);
    const c = randState(r, d);
    check(eqState(addState(a, b), addState(b, a)), `add_comm_${i}`, fail);
    check(eqState(addState(addState(a, b), c), addState(a, addState(b, c))), `add_assoc_${i}`, fail);
    check(eqState(addState(a, Z), a) && eqState(addState(Z, a), a), `add_zero_${i}`, fail);
    check(eqState(addState(a, negState(a)), Z), `add_inv_${i}`, fail);
    check(eqState(mulState(a, b), mulState(b, a)), `mul_comm_${i}`, fail);
    check(eqState(mulState(mulState(a, b), c), mulState(a, mulState(b, c))), `mul_assoc_${i}`, fail);
    check(eqState(mulState(a, O), a) && eqState(mulState(O, a), a), `mul_one_${i}`, fail);
    check(
      eqState(mulState(a, addState(b, c)), addState(mulState(a, b), mulState(a, c))),
      `left_dist_${i}`,
      fail,
    );
    check(
      eqState(mulState(addState(a, b), c), addState(mulState(a, c), mulState(b, c))),
      `right_dist_${i}`,
      fail,
    );
  }

  for (let i = 0; i < N; i += 1) {
    const a = randRealState(r, d);
    const b = randRealState(r, d);
    check(isRealState(a), `real_gen_a_${i}`, fail);
    check(isRealState(b), `real_gen_b_${i}`, fail);
    check(isRealState(addState(a, b)), `real_add_${i}`, fail);
    check(isRealState(mulState(a, b)), `real_mul_${i}`, fail);
  }

  const x = randState(r, d);
  check(eqState(subState(x, x), Z), "canonical_zero", fail);
  check(serial(subState(x, x)).length === 0, "canonical_zero_serial", fail);
  check(
    JSON.stringify(serial(oneState(2))) === JSON.stringify([[[0, 0], ["1", "0"]]]),
    "canonical_one",
    fail,
  );

  const c1 = basisCos(1, 1);
  const s2 = basisSin(2, 1);
  const mixed = mulState(c1, s2);
  check(eqState(mixed, mulState(s2, c1)), "regression_mixed_order_commutativity", fail);
  check(eqState(mixed, mixedOrderExpected()), "regression_mixed_order_formula", fail);

  const prod = mulState(c1, c1);
  check(eqState(prod, zeroFrequencyExpected()), "regression_zero_frequency_preserved", fail);
  const unit = prod.c.get("0") ?? { a: frac(0), b: frac(0) };
  check(unit.a.n === 1n && unit.a.d === 2n && unit.b.n === 0n, "unit_frequency_coefficient_half", fail);

  return {
    schema: "orb1-step-zero-exact-check/1",
    seed,
    randomRingCases: N,
    randomRealInvariantCases: N,
    coefficientDomain: "Gaussian rationals Q(i)",
    frequencyGroup: `Z^${d} for randomized tests; Z for regressions`,
    exactArithmetic: true,
    toleranceUsed: false,
    failureCount: fail.length,
    failures: fail.slice(0, 50),
    mixedRegressionProduct: serial(mixed),
    zeroFrequencyRegressionProduct: serial(prod),
    verdict: fail.length === 0 ? "SURVIVED_IMPLEMENTATION_FALSIFICATION" : "REFUTED",
    prng: "mulberry32",
    note: "JS randomized cases use mulberry32, not Python random.Random. Regressions are seed-free.",
  };
}

export function leibnizHolds(f: State, g: State, j: number): boolean {
  const left = coordDerive(mulState(f, g), j);
  const right = addState(mulState(coordDerive(f, j), g), mulState(f, coordDerive(g, j)));
  return eqState(left, right);
}

export function translationUnits(): GQ[] {
  return [gq(1, 0), gq(-1, 0), gq(0, 1), gq(0, -1), gq(frac(3, 5), frac(4, 5))];
}

export function translationRoundtrip(s: State, u: GQ[]): boolean {
  if (u.some((z) => !isQiUnitCircle(z))) return false;
  const inv = u.map((z) => ({ a: z.a, b: { n: -z.b.n, d: z.b.d } }));
  return eqState(translate(translate(s, u), inv), s);
}
