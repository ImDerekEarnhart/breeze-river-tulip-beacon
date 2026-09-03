import type { OrbitaRecord } from "./types";

export const ARCHIVED_EXPERIMENTS: OrbitaRecord[] = [
  {
    caseId: "case-a1b0c2d3",
    question: "Does a reranker after BM25 improve precision@5 for agent memory?",
    plan: `Hypothesis: title/tag-aware rerank of the top 12 BM25 hits raises precision@5 on architecture queries versus BM25 alone.
Method: freeze a 12-query gold set covering teacher routing, sandbox policy, HodgeForm, vLLM, and memory kinds. Run BM25-only vs BM25+rerank. Score precision@5 against gold ids.
Success: +0.10 precision@5 without dropping recall@5 more than 0.05.
Falsification: rerank precision@5 <= BM25 or recall drop > 0.05.
Sandbox: compute precision tables only; no model weights change.`,
    planHash: "a1b0c2d3e4f5061728394a5b6c7d8e9f00112233445566778899aabbccddeeff",
    status: "evaluated",
    discovery:
      "BM25 P@5 = 0.62. BM25+rerank P@5 = 0.78. Recall@5 unchanged at 0.84. Gold set n=12.",
    evaluation: {
      pass: true,
      notes: "Success criterion met. Frozen plan hash matches execution log. Promote rerank into the language tower.",
    },
    createdAt: 1755600000000,
  },
  {
    caseId: "case-9f21aa07",
    question: "Does the student emit valid tool JSON more often with schema-constrained decoding?",
    plan: `Hypothesis: forcing JSON schema on the student reduces tool-call parse failures versus free prose.
Method: 40 held-out tasks requiring one sandbox or retrieve call. Compare unconstrained vs json_object decoding.
Success: parse-failure rate < 5% and no increase in wrong-tool rate.
Falsification: parse failures stay >= 12% or wrong-tool rate rises.`,
    planHash: "9f21aa0700112233445566778899aabbccddeeff00112233445566778899aabb",
    status: "evaluated",
    discovery:
      "Unconstrained parse fail 18%. Schema-constrained parse fail 2.5%. Wrong-tool 6% vs 5%.",
    evaluation: {
      pass: true,
      notes: "Keep structured outputs on the worker. Record as a training prior for LoRA later.",
    },
    createdAt: 1755420000000,
  },
];
