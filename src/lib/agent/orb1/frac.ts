/** Exact rational n/d. Always reduced, denominator > 0. No float, no tolerance. */

export type Frac = { n: bigint; d: bigint };

function abs(n: bigint): bigint {
  return n < 0n ? -n : n;
}

export function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a);
  let y = abs(b);
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0n ? 1n : x;
}

export function frac(n: bigint | number | string, d: bigint | number | string = 1n): Frac {
  let nn = typeof n === "bigint" ? n : BigInt(n);
  let dd = typeof d === "bigint" ? d : BigInt(d);
  if (dd === 0n) throw new Error("Frac: division by zero");
  if (dd < 0n) {
    nn = -nn;
    dd = -dd;
  }
  const g = gcd(nn, dd);
  return { n: nn / g, d: dd / g };
}

export function parseFrac(s: string): Frac {
  const t = s.trim();
  const slash = t.indexOf("/");
  if (slash < 0) return frac(t, 1n);
  return frac(t.slice(0, slash), t.slice(slash + 1));
}

export function formatFrac(f: Frac): string {
  if (f.d === 1n) return f.n.toString();
  return `${f.n}/${f.d}`;
}

export function eqFrac(a: Frac, b: Frac): boolean {
  return a.n === b.n && a.d === b.d;
}

export function addFrac(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function subFrac(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mulFrac(a: Frac, b: Frac): Frac {
  return frac(a.n * b.n, a.d * b.d);
}

export function negFrac(a: Frac): Frac {
  return { n: -a.n, d: a.d };
}

export function absFracN(f: Frac): bigint {
  return abs(f.n);
}

export function absFracD(f: Frac): bigint {
  return abs(f.d);
}
