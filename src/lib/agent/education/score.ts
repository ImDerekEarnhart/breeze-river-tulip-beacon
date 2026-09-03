import { SMOKE_ITEMS, type SmokeItem } from "./items.ts";

/** Local education failures only. LANGUAGE_LIMIT is not representable here. */
export const EDUCATION_FAILURE_KINDS = [
  "MISSING_ANSWER",
  "WRONG_LABEL",
  "FORBIDDEN_LABEL",
] as const;

export type EducationFailureKind = (typeof EDUCATION_FAILURE_KINDS)[number];

export type EducationScore = {
  pass: boolean;
  reason: string;
  kind: EducationFailureKind | null;
  languageLimit: false;
};

export function normalizeLabel(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchSmokeItem(request: string): SmokeItem | null {
  const n = normalizeLabel(request);
  for (const item of SMOKE_ITEMS) {
    if (item.match.every((m) => n.includes(normalizeLabel(m)))) return item;
  }
  return null;
}

export function scoreAnswer(
  answer: string,
  item: SmokeItem,
  confidence = 0,
): EducationScore {
  const raw = (answer ?? "").trim();
  if (raw.length < 2) {
    return {
      pass: false,
      reason: "Missing answer",
      kind: "MISSING_ANSWER",
      languageLimit: false,
    };
  }
  const n = normalizeLabel(raw);
  for (const f of item.forbidden) {
    if (n.includes(normalizeLabel(f))) {
      return {
        pass: false,
        reason: `Forbidden label (${f})`,
        kind: "FORBIDDEN_LABEL",
        languageLimit: false,
      };
    }
  }
  const needles = [item.expected, ...item.aliases].map(normalizeLabel);
  const hit = needles.some((needle) => needle.length > 0 && n.includes(needle));
  if (!hit) {
    return {
      pass: false,
      reason:
        confidence >= 0.8 ? "High-confidence wrong label" : "Wrong or incomplete label",
      kind: "WRONG_LABEL",
      languageLimit: false,
    };
  }
  return {
    pass: true,
    reason: "Exact semantic-label match",
    kind: null,
    languageLimit: false,
  };
}
