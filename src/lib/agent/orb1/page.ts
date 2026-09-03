import { absFracD, absFracN, type Frac } from "./frac.ts";
import type { GQ } from "./gaussian.ts";

/** Signed 16-bit paging overflow. Labeled simulation — not an ISA, not a Tower VM. */
export const PAGE_LIMIT = 2n ** 15n;
export const PAGE_LABEL = "simulated-16-bit-overflow" as const;

export type PageCheck = {
  status: "OK" | "OVERFLOW";
  simulated: true;
  notARegisterMachine: true;
  notTheTowerVm: true;
  label: typeof PAGE_LABEL;
  nAbs: string;
  dAbs: string;
  limit: string;
};

export function pageFrac(f: Frac): PageCheck {
  const nAbs = absFracN(f);
  const dAbs = absFracD(f);
  const overflow = nAbs >= PAGE_LIMIT || dAbs >= PAGE_LIMIT;
  return {
    status: overflow ? "OVERFLOW" : "OK",
    simulated: true,
    notARegisterMachine: true,
    notTheTowerVm: true,
    label: PAGE_LABEL,
    nAbs: nAbs.toString(),
    dAbs: dAbs.toString(),
    limit: PAGE_LIMIT.toString(),
  };
}

export function pageGQ(z: GQ): PageCheck {
  const a = pageFrac(z.a);
  const b = pageFrac(z.b);
  return a.status === "OVERFLOW" ? a : b;
}
