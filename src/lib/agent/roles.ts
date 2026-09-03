/** Frozen ontology from HodgeForm case_c79bed8f9bd34612 / loop problem_loop_541ce2f1fac54e92.
 * Operator-chat Core, not app MCP. Prose did not pick a winner; these contracts did. */

export const RETRIEVE_STEP_TITLE = "Retrieval";
export const RETRIEVE_PROVENANCE = "retrieval:bm25-rerank";
export const TEACHER_ROUTE_EVENT = "teacher_route";
export const POLICY_VERSION = "guided-route/1";

export const ARCHITECTURE_LOOP = {
  channel: "operator-chat" as const,
  notFromAppMcp: true,
  caseId: "case_c79bed8f9bd34612",
  loopId: "problem_loop_541ce2f1fac54e92",
  state: "RETRY" as const,
  composition: "Candidate B infrastructure + Candidate A ontology + HodgeForm change boundary",
  latestEventHash: "5c339c5dbc74b6c01900a0aafef4db0f7e7422cc42e3f4a123b60b1df12d5c23",
  retryAuthorized: true,
  diagnosedLimitation: "VERIFIER_LIMIT" as const,
  repairKind: "verifier" as const,
  candidateHash: "53f3b10fb903f3330152deefa2d885882ec4397252ad75145f8b88a3529c7449",
  activationRequested: false,
  coreApproved: false,
};

export const ROLE_AXIOMS = [
  "Language Tower ≠ RAG",
  "vLLM ≠ student",
  "Teacher ≠ fallback student",
  "Orbita ≠ worker",
  "Retrieval ≠ semantic language",
  "Student = local worker model",
  "Language Tower = governed L_t",
  "Retrieval = context acquisition",
  "Teacher = explicit escalation / proposer",
  "Orbita / HodgeForm = freeze / falsify / govern",
  "Sandbox = execution authority",
  "Verifier = outcome check",
] as const;

export type TeacherRouteReason =
  | "verification_failed"
  | "student_requested"
  | "low_confidence"
  | "governed_plan"
  | "parse_failure";

export type FailClosedReason =
  | "student_unconfigured"
  | "student_provider_error"
  | "mcp_unauthenticated"
  | "teacher_provider_error"
  | "mcp_catalog_incomplete";

export type RouteDecision = {
  path: "student" | "teacher" | "fail_closed";
  reason: TeacherRouteReason | FailClosedReason | "fast_path";
  teacherSubstituted: false;
  policyVersion: string;
  studentAttemptId?: string;
  studentModel?: string;
};

export function routeWhenStudentMissing(mode: "fast" | "governed"): RouteDecision {
  if (mode === "governed") {
    return {
      path: "teacher",
      reason: "governed_plan",
      teacherSubstituted: false,
      policyVersion: POLICY_VERSION,
    };
  }
  return {
    path: "fail_closed",
    reason: "student_unconfigured",
    teacherSubstituted: false,
    policyVersion: POLICY_VERSION,
  };
}

export function routeAfterVerify(opts: {
  pass: boolean;
  action: "answer" | "tool" | "escalate";
  confidence: number;
  parseFailed?: boolean;
  studentAttemptId: string;
  studentModel?: string;
}): RouteDecision {
  const base = {
    teacherSubstituted: false as const,
    policyVersion: POLICY_VERSION,
    studentAttemptId: opts.studentAttemptId,
    studentModel: opts.studentModel,
  };
  if (opts.parseFailed) {
    return { path: "teacher", reason: "parse_failure", ...base };
  }
  if (!opts.pass) {
    return { path: "teacher", reason: "verification_failed", ...base };
  }
  if (opts.action === "escalate") {
    return { path: "teacher", reason: "student_requested", ...base };
  }
  if (opts.confidence < 0.55) {
    return { path: "teacher", reason: "low_confidence", ...base };
  }
  return { path: "student", reason: "fast_path", ...base };
}

export type FalsifierId =
  | "tower_is_only_rag"
  | "silent_teacher_substitution"
  | "teacher_cost_no_gain"
  | "retrieval_tower_coupled"
  | "self_promotion"
  | "unrestricted_shell";

export type Falsifier = {
  id: FalsifierId;
  claim: string;
  localStatus: "survives" | "not_run" | "blocked";
  note: string;
};

export const FALSIFIERS: Falsifier[] = [
  {
    id: "tower_is_only_rag",
    claim: "If Tower interfaces are only embedding / search / rerank, the L_t reading is refuted for this app.",
    localStatus: "survives",
    note: "Retrieval is BM25. Tower page is fiber collision + Q(i) admission + manifesto pipeline — still not a Tower VM.",
  },
  {
    id: "silent_teacher_substitution",
    claim: "If loss of the student silently invokes the teacher, fail-closed is refuted.",
    localStatus: "survives",
    note: "Fast path with no STUDENT_BASE_URL fail-closes. Grok is never the worker.",
  },
  {
    id: "teacher_cost_no_gain",
    claim: "If teacher escalation does not improve quality enough to justify latency/cost, the routing policy is rejected.",
    localStatus: "blocked",
    note: "Needs a live student GPU and equal-budget tasks. Not run.",
  },
  {
    id: "retrieval_tower_coupled",
    claim: "If retrieval and Tower modifications cannot be measured independently, the architecture is too coupled.",
    localStatus: "survives",
    note: "Retrieve steps are labeled Retrieval. Tower tiles do not light on retrieve.",
  },
  {
    id: "self_promotion",
    claim: "If a semantic repair or model update can promote itself, the governance boundary fails.",
    localStatus: "survives",
    note: "Local snapshot promotion_enabled is false. Guided does not auto-approve Core plans.",
  },
  {
    id: "unrestricted_shell",
    claim: "If a model-originated tool call can get unrestricted host shell access, the execution boundary fails.",
    localStatus: "survives",
    note: "Tools are an explicit set. Sandbox is isolated Python. Desktop is simulated and deny-listed for sudo/ssh.",
  },
];

export type ArchNodeId =
  | "api"
  | "orchestrator"
  | "retrieval"
  | "tower"
  | "student"
  | "vllm"
  | "sandbox"
  | "verify"
  | "teacher"
  | "orbita"
  | "desktop";

export type ArchPlane = "fast" | "govern";

export const ARCH_NODES: {
  id: ArchNodeId;
  plane: ArchPlane;
  label: string;
  sub: string;
  kinds: string[];
}[] = [
  { id: "api", plane: "fast", label: "User / API", sub: "entry surface", kinds: ["answer"] },
  {
    id: "orchestrator",
    plane: "fast",
    label: "Controller",
    sub: "route · state · policy",
    kinds: ["route"],
  },
  {
    id: "retrieval",
    plane: "fast",
    label: "Retrieval",
    sub: "BM25 + rerank · not L_t",
    kinds: ["retrieve"],
  },
  {
    id: "tower",
    plane: "govern",
    label: "Language Tower",
    sub: "current executable L_t",
    kinds: [],
  },
  {
    id: "student",
    plane: "fast",
    label: "Student",
    sub: "GPU worker · not Grok",
    kinds: ["reason"],
  },
  {
    id: "vllm",
    plane: "fast",
    label: "vLLM",
    sub: "serves the student · not a model",
    kinds: [],
  },
  {
    id: "sandbox",
    plane: "fast",
    label: "Tools / sandbox",
    sub: "policy then isolated python",
    kinds: ["tool"],
  },
  {
    id: "verify",
    plane: "fast",
    label: "Verifier",
    sub: "outcome check",
    kinds: ["verify"],
  },
  {
    id: "teacher",
    plane: "govern",
    label: "Teacher",
    sub: "explicit escalation · not fallback",
    kinds: ["escalate"],
  },
  {
    id: "orbita",
    plane: "govern",
    label: "Orbita / HodgeForm",
    sub: "freeze · falsify · govern",
    kinds: ["orbita"],
  },
  {
    id: "desktop",
    plane: "govern",
    label: "PocketDesktop",
    sub: "simulated · not Core",
    kinds: ["tool"],
  },
];

export const NODE_COPY: Record<ArchNodeId, string> = {
  api: "Entry surface. The user never talks to a model directly — every request hits the controller.",
  orchestrator:
    "Router, working state, tool policy, and verifier. Chooses student vs explicit teacher route. Records traces and receipts. Missing student does not become Grok.",
  retrieval:
    "Context acquisition. This preview is lexical BM25 plus title/tag rerank. It is not embeddings, not a vector DB, and not the Language Tower.",
  tower:
    "Current executable L_t — what the governed system can represent, express, and distinguish. This preview does not host the Tower VM. Fiber collision, Q(i) admission, and the FLM kernel are local controls. LANGUAGE_LIMIT is a Core theorem. Orbita governs promotion.",

  student:
    "Replaceable GPU worker model. Configured only by STUDENT_BASE_URL + model id. Grok is never silently substituted for this role.",
  vllm: "Inference server for the student. OpenAI-compatible POST /v1/chat/completions. Not a model, not the agent, not the teacher.",
  sandbox:
    "Tool policy then isolated execution. The model emits a schema-checked action; a worker runs it. The runner does not issue scientific verdicts.",
  verify:
    "Two layers. Shallow fast-path check (presence / length / confidence) still exists for unmatched requests — that is VERIFIER_LIMIT. The local education scorer grades frozen smoke labels only. It does not issue LANGUAGE_LIMIT. Teacher corrections stay quarantined until this scorer passes them. Not Core.",
  teacher:
    "Stronger proposer and correction. Called only with a reason: verification_failed, student_requested, low_confidence, parse_failure, or governed_plan. Not a fallback student. Explorer, never the authority that grades its own repairs.",
  orbita:
    "Epistemic governor. Off the token-by-token fast path. Freeze, test, falsify, receipt. Inactive candidates do not auto-activate. The Tower may propose L_t+1. Only Orbita may admit it.",
  desktop:
    "SIMULATED in this app. A real PocketDesktop is a later governed action adapter. Not Hodgeform Core, not a root shell.",
};
