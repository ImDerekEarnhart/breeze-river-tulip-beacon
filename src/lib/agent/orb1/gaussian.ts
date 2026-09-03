import {
  addFrac,
  eqFrac,
  formatFrac,
  frac,
  mulFrac,
  negFrac,
  parseFrac,
  subFrac,
  type Frac,
} from "./frac.ts";

/** Gaussian rational a + b i, a,b in Q. Exact. */
export type GQ = { a: Frac; b: Frac };

export function gq(a: Frac | bigint | number | string = 0, b: Frac | bigint | number | string = 0): GQ {
  return {
    a: typeof a === "object" ? a : frac(a),
    b: typeof b === "object" ? b : frac(b),
  };
}

export function parseGQ(pair: [string, string]): GQ {
  return { a: parseFrac(pair[0]), b: parseFrac(pair[1]) };
}

export function formatGQ(z: GQ): [string, string] {
  return [formatFrac(z.a), formatFrac(z.b)];
}

export const GQ_ZERO = gq(0, 0);
export const GQ_ONE = gq(1, 0);
export const GQ_I = gq(0, 1);

export function isZeroGQ(z: GQ): boolean {
  return z.a.n === 0n && z.b.n === 0n;
}

export function eqGQ(x: GQ, y: GQ): boolean {
  return eqFrac(x.a, y.a) && eqFrac(x.b, y.b);
}

export function addGQ(x: GQ, y: GQ): GQ {
  return { a: addFrac(x.a, y.a), b: addFrac(x.b, y.b) };
}

export function negGQ(x: GQ): GQ {
  return { a: negFrac(x.a), b: negFrac(x.b) };
}

export function subGQ(x: GQ, y: GQ): GQ {
  return addGQ(x, negGQ(y));
}

export function mulGQ(x: GQ, y: GQ): GQ {
  return {
    a: subFrac(mulFrac(x.a, y.a), mulFrac(x.b, y.b)),
    b: addFrac(mulFrac(x.a, y.b), mulFrac(x.b, y.a)),
  };
}

export function conjGQ(x: GQ): GQ {
  return { a: x.a, b: negFrac(x.b) };
}

export function normGQ(x: GQ): Frac {
  return addFrac(mulFrac(x.a, x.a), mulFrac(x.b, x.b));
}

/** u on the Q(i) unit circle iff a² + b² = 1 exactly. */
export function isQiUnitCircle(x: GQ): boolean {
  return eqFrac(normGQ(x), frac(1n));
}

export function invGQ(x: GQ): GQ {
  const n = normGQ(x);
  if (n.n === 0n) throw new Error("GQ: inverse of zero");
  const c = conjGQ(x);
  return {
    a: frac(c.a.n * n.d, c.a.d * n.n),
    b: frac(c.b.n * n.d, c.b.d * n.n),
  };
}

function reduceGQ(z: GQ): GQ {
  return { a: frac(z.a.n, z.a.d), b: frac(z.b.n, z.b.d) };
}

export function powGQ(u: GQ, exp: number): GQ {
  if (!Number.isInteger(exp)) throw new Error("GQ: non-integer power");
  if (exp === 0) return GQ_ONE;
  if (exp < 0) return powGQ(reduceGQ(invGQ(u)), -exp);
  let acc = GQ_ONE;
  let base = u;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) acc = mulGQ(acc, base);
    base = mulGQ(base, base);
    e = Math.floor(e / 2);
  }
  return acc;
}

/** Gaussian integer units {1,-1,i,-i}. Proper subset of the Q(i) unit circle. */
export function isGaussianIntegerUnit(x: GQ): boolean {
  const units = [gq(1, 0), gq(-1, 0), gq(0, 1), gq(0, -1)];
  return units.some((u) => eqGQ(u, x));
}
