import {
  addGQ,
  conjGQ,
  eqGQ,
  formatGQ,
  GQ_ONE,
  GQ_ZERO,
  isZeroGQ,
  mulGQ,
  negGQ,
  powGQ,
  type GQ,
} from "./gaussian.ts";

export type State = {
  d: number;
  c: Map<string, GQ>;
};

export function keyOf(k: readonly number[]): string {
  return k.join(",");
}

export function parseKey(s: string): number[] {
  if (s === "") return [];
  return s.split(",").map((x) => Number(x));
}

function cmpKey(a: number[], b: number[]): number {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    const da = a[i] ?? 0;
    const db = b[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

export function emptyState(d: number): State {
  return { d, c: new Map() };
}

export function oneState(d: number): State {
  const s = emptyState(d);
  s.c.set(keyOf(Array.from({ length: d }, () => 0)), GQ_ONE);
  return s;
}

export function fromTerms(d: number, terms: Iterable<[readonly number[], GQ]>): State {
  const s = emptyState(d);
  for (const [k, v] of terms) {
    if (k.length !== d) throw new Error("State: bad key dimension");
    addTerm(s, k, v);
  }
  return s;
}

function addTerm(s: State, k: readonly number[], v: GQ): void {
  if (isZeroGQ(v)) return;
  const id = keyOf(k);
  const prev = s.c.get(id);
  const next = prev ? addGQ(prev, v) : v;
  if (isZeroGQ(next)) s.c.delete(id);
  else s.c.set(id, next);
}

export function cloneState(a: State): State {
  return fromTerms(
    a.d,
    Array.from(a.c.entries(), ([k, v]) => [parseKey(k), v]),
  );
}

export function addState(a: State, b: State): State {
  if (a.d !== b.d) throw new Error("State: dimension mismatch");
  const z = cloneState(a);
  for (const [k, v] of b.c) addTerm(z, parseKey(k), v);
  return z;
}

export function negState(a: State): State {
  return fromTerms(
    a.d,
    Array.from(a.c.entries(), ([k, v]) => [parseKey(k), negGQ(v)]),
  );
}

export function subState(a: State, b: State): State {
  return addState(a, negState(b));
}

export function mulState(a: State, b: State): State {
  if (a.d !== b.d) throw new Error("State: dimension mismatch");
  const z = emptyState(a.d);
  for (const [ks, av] of a.c) {
    const k = parseKey(ks);
    for (const [js, bv] of b.c) {
      const j = parseKey(js);
      const q = k.map((x, i) => x + (j[i] ?? 0));
      addTerm(z, q, mulGQ(av, bv));
    }
  }
  return z;
}

export function starState(a: State): State {
  return fromTerms(
    a.d,
    Array.from(a.c.entries(), ([k, v]) => [parseKey(k).map((x) => -x), conjGQ(v)]),
  );
}

export function eqState(a: State, b: State): boolean {
  if (a.d !== b.d || a.c.size !== b.c.size) return false;
  for (const [k, v] of a.c) {
    const w = b.c.get(k);
    if (!w || !eqGQ(v, w)) return false;
  }
  return true;
}

export function isRealState(a: State): boolean {
  return eqState(a, starState(a));
}

export function serial(a: State): [number[], [string, string]][] {
  const keys = [...a.c.keys()].sort((x, y) => cmpKey(parseKey(x), parseKey(y)));
  return keys.map((k) => {
    const v = a.c.get(k) ?? GQ_ZERO;
    return [parseKey(k), formatGQ(v)];
  });
}

export function basisCos(n: number, d = 1): State {
  const k = [n, ...Array.from({ length: d - 1 }, () => 0)];
  const nk = k.map((x) => -x);
  return fromTerms(d, [
    [k, { a: { n: 1n, d: 2n }, b: { n: 0n, d: 1n } }],
    [nk, { a: { n: 1n, d: 2n }, b: { n: 0n, d: 1n } }],
  ]);
}

export function basisSin(n: number, d = 1): State {
  const k = [n, ...Array.from({ length: d - 1 }, () => 0)];
  const nk = k.map((x) => -x);
  return fromTerms(d, [
    [k, { a: { n: 0n, d: 1n }, b: { n: -1n, d: 2n } }],
    [nk, { a: { n: 0n, d: 1n }, b: { n: 1n, d: 2n } }],
  ]);
}

/** Coordinate derivation D_j: multiply mode n by i * n_j. In Q(i) for integer n. */
export function coordDerive(s: State, j: number): State {
  if (j < 0 || j >= s.d) throw new Error("D_j: bad axis");
  const z = emptyState(s.d);
  for (const [ks, v] of s.c) {
    const k = parseKey(ks);
    const nj = k[j] ?? 0;
    if (nj === 0) continue;
    addTerm(z, k, mulGQ(v, { a: { n: 0n, d: 1n }, b: { n: BigInt(nj), d: 1n } }));
  }
  return z;
}

/**
 * Exact translation T_u on Fourier modes: c_n ↦ c_n * Π_j u_j^{n_j}.
 * Caller must pass u on the Q(i) unit circle^d.
 */
export function translate(s: State, u: GQ[]): State {
  if (u.length !== s.d) throw new Error("T_u: bad dimension");
  const z = emptyState(s.d);
  for (const [ks, v] of s.c) {
    const k = parseKey(ks);
    let phasor = GQ_ONE;
    for (let j = 0; j < s.d; j += 1) {
      phasor = mulGQ(phasor, powGQ(u[j]!, k[j] ?? 0));
    }
    addTerm(z, k, mulGQ(v, phasor));
  }
  return z;
}
