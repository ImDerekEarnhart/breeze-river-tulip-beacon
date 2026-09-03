import { eqFrac, frac, type Frac } from "./frac.ts";
import { gq, isQiUnitCircle, type GQ } from "./gaussian.ts";

export type AdmitDecision = {
  operatorId: string;
  family:
    | "coordinate_derivations"
    | "exact_translations"
    | "rational_directional_derivations"
    | "language_limit_of_ring"
    | "unknown";
  decision: "ADMIT" | "QUARANTINE";
  ring: "Q(i)[Z^d]";
  inQi: boolean;
  reason: string;
  multiplierNeeded?: string;
  phasorNeeded?: string;
  coreLanguageLimit: false;
  earned: false;
  scopeClaim: "coefficient_ring_only";
  translationParameterDomain?: string;
};

const RING = "Q(i)[Z^d]" as const;

const BASE = {
  ring: RING,
  coreLanguageLimit: false as const,
  earned: false as const,
  scopeClaim: "coefficient_ring_only" as const,
};

const TRANSLATION_DOMAIN =
  "u in (Q(i) unit circle)^d, exact phasors with u*conj(u)=1";

export const ORB1_OPERATORS = [
  "coordinate_derivation",
  "exact_translation",
  "rational_directional_derivation",
  "physical_derivative_sqrt2",
  "shift_pi_over_4",
] as const;

export type Orb1OperatorId = (typeof ORB1_OPERATORS)[number];

function aliases(raw: string): string {
  const id = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (id === "d" || id === "d_j" || id === "coordinate_derivations") return "coordinate_derivation";
  if (id === "t" || id === "t_u" || id === "exact_translations") return "exact_translation";
  if (id === "directional" || id === "rational_directional_derivations") {
    return "rational_directional_derivation";
  }
  if (id === "sqrt2" || id === "√2" || id === "physical_derivative") return "physical_derivative_sqrt2";
  if (id === "pi/4" || id === "π/4" || id === "shift_pi4") return "shift_pi_over_4";
  return id;
}

export function admitOperator(raw: string): AdmitDecision {
  const operatorId = aliases(raw);
  if (operatorId === "coordinate_derivation") {
    return {
      ...BASE,
      operatorId,
      family: "coordinate_derivations",
      decision: "ADMIT",
      inQi: true,
      reason: "D_j multiplies mode n by i·n_j. Integer n_j keeps the coefficient in Q(i).",
    };
  }
  if (operatorId === "exact_translation") {
    return {
      ...BASE,
      operatorId,
      family: "exact_translations",
      decision: "ADMIT",
      inQi: true,
      reason:
        "T_u is admitted when every phasor u_j lies on the Q(i) unit circle (a²+b²=1 in Q). Gaussian integer units 1,-1,i,-i are included. (3/5)+(4/5)i is included. (1+i)/√2 is not in Q(i).",
      translationParameterDomain: TRANSLATION_DOMAIN,
    };
  }
  if (operatorId === "rational_directional_derivation") {
    return {
      ...BASE,
      operatorId,
      family: "rational_directional_derivations",
      decision: "ADMIT",
      inQi: true,
      reason: "Directional D_v = Σ v_j D_j is admitted when each v_j is in Q.",
    };
  }
  if (operatorId === "physical_derivative_sqrt2") {
    return {
      ...BASE,
      operatorId,
      family: "language_limit_of_ring",
      decision: "QUARANTINE",
      inQi: false,
      multiplierNeeded: "i*sqrt(2)*n",
      reason:
        "sqrt(2) is irrational, while every Q(i) element has rational real and imaginary parts. This is a coefficient-ring limit of Q(i)[Z^d], not a Hodgeform Core LANGUAGE_LIMIT, and it is never EARNED.",
    };
  }
  if (operatorId === "shift_pi_over_4") {
    return {
      ...BASE,
      operatorId,
      family: "language_limit_of_ring",
      decision: "QUARANTINE",
      inQi: false,
      phasorNeeded: "(1+i)/sqrt(2)",
      reason:
        "1/sqrt(2) is irrational, so the π/4 phasor is not in Q(i). This is a coefficient-ring limit of Q(i)[Z^d], not a Hodgeform Core LANGUAGE_LIMIT, and it is never EARNED.",
    };
  }
  return {
    ...BASE,
    operatorId: operatorId || "unknown",
    family: "unknown",
    decision: "QUARANTINE",
    inQi: false,
    reason: "Unknown operator. Fail closed. Local admission does not invent Core theorems.",
  };
}

export function admitPhasor(u: GQ): {
  admitted: boolean;
  inQi: true;
  onUnitCircle: boolean;
  reason: string;
} {
  const onUnitCircle = isQiUnitCircle(u);
  return {
    admitted: onUnitCircle,
    inQi: true,
    onUnitCircle,
    reason: onUnitCircle
      ? "Phasor is in Q(i) and a²+b²=1."
      : "Phasor is in Q(i) but not on the unit circle, so T_u is not an isometry of this ring.",
  };
}

export function pythagoreanPhasor(a: Frac, b: Frac): GQ {
  return gq(a, b);
}

/** Canonical π/4 phasor is not representable in Q(i). */
export function piOver4InQi(): false {
  return false;
}

export function sqrt2InQ(): false {
  return false;
}

export function directionalWeightsInQ(weights: Frac[]): boolean {
  return weights.every((w) => w.d !== 0n && eqFrac(frac(w.n, w.d), w));
}
