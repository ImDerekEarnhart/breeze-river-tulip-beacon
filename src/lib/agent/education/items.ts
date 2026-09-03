/** Operator-visible English smoke suite. Not sealed, not held-out, not Core. */

export type SmokeItem = {
  id: string;
  prompt: string;
  expected: string;
  aliases: string[];
  forbidden: string[];
  match: string[];
};

export const SMOKE_SUITE_ID = "guided-education-smoke/1" as const;

export const SMOKE_ITEMS: SmokeItem[] = [
  {
    id: "who-student",
    prompt: "Who is the student in Hodgeform Guided?",
    expected: "gpu worker",
    aliases: ["local worker", "worker model", "vllm worker"],
    forbidden: ["grok"],
    match: ["who", "student"],
  },
  {
    id: "retrieval-not-tower",
    prompt: "Is retrieval the Language Tower?",
    expected: "no",
    aliases: ["not the language tower", "not the tower"],
    forbidden: ["yes"],
    match: ["retrieval", "language tower"],
  },
  {
    id: "missing-student",
    prompt: "If the student is missing, what happens?",
    expected: "fail closed",
    aliases: ["fail-closed", "refuses", "does not use the teacher"],
    forbidden: ["use grok as the student", "silent fallback", "always call the teacher"],
    match: ["student", "missing"],
  },
  {
    id: "teacher-when",
    prompt: "When should the worker escalate?",
    expected: "verification fails",
    aliases: ["low confidence", "governed plan", "explicit"],
    forbidden: ["always call the teacher", "silently"],
    match: ["escalate"],
  },
  {
    id: "local-not-language-limit",
    prompt: "Can a local NLP miss issue LANGUAGE_LIMIT?",
    expected: "no",
    aliases: ["verifier limit", "not language_limit"],
    forbidden: ["yes"],
    match: ["language_limit"],
  },
];
