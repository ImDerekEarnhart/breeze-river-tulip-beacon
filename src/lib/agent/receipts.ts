function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export const RECEIPT_SCHEMA = "guided-receipt/1" as const;

export type ReceiptKind =
  | "context"
  | "proposal"
  | "execution"
  | "verification"
  | "admission"
  | "control";

export type ContextPayload = {
  type: "context";
  docIds: string[];
  titles: string[];
  backend: "bm25-rerank";
};

export type ProposalAction =
  | "answer"
  | "tool"
  | "escalate"
  | "plan"
  | "refine"
  | "quotient"
  | "observe"
  | "merge"
  | "route";

export type ProposalRole = "student" | "teacher" | "local";

export type ProposalPayload = {
  type: "proposal";
  summary: string;
  candidateCount: number;
  action: ProposalAction;
  role: ProposalRole;
  coreApproved: false;
  candidateHash?: string;
};

export type ExecutionPayload = {
  type: "execution";
  capability: string;
  ok: boolean;
  outputPreview: string;
  outputHash: string;
};

export type VerificationPayload = {
  type: "verification";
  pass: boolean;
  reason: string;
  confidence: number;
};

export type AdmissionPayload = {
  type: "admission";
  operatorId: string;
  decision: "ADMIT" | "QUARANTINE";
  ring: "Q(i)[Z^d]";
  coreLanguageLimit: false;
  earned: false;
};

export type ControlPayload = {
  type: "control";
  event: string;
  message: string;
};

export type ReceiptPayload =
  | ContextPayload
  | ProposalPayload
  | ExecutionPayload
  | VerificationPayload
  | AdmissionPayload
  | ControlPayload;

export type ReceiptEnvelope = {
  schemaVersion: typeof RECEIPT_SCHEMA;
  id: string;
  hash: string;
  kind: ReceiptKind;
  runId: string;
  producer: string;
  createdAt: number;
  parentReceiptIds: string[];
  provenance: string[];
  payload: ReceiptPayload;
};

export type ReceiptDraft = Omit<ReceiptEnvelope, "hash" | "schemaVersion">;

/** Canonical body for hashing. The hash field is excluded by construction. */
export function unsignedReceiptBody(draft: ReceiptDraft): Omit<ReceiptEnvelope, "hash"> {
  return {
    schemaVersion: RECEIPT_SCHEMA,
    id: draft.id,
    kind: draft.kind,
    runId: draft.runId,
    producer: draft.producer,
    createdAt: draft.createdAt,
    parentReceiptIds: [...draft.parentReceiptIds],
    provenance: [...draft.provenance],
    payload: draft.payload,
  };
}

export function canonicalUnsigned(draft: ReceiptDraft): string {
  return stableStringify(unsignedReceiptBody(draft));
}

export function lastReceiptParents(receipts: ReceiptEnvelope[]): string[] {
  const last = receipts[receipts.length - 1];
  return last ? [last.id] : [];
}

export function isProposalApproved(payload: ProposalPayload): false {
  return payload.coreApproved;
}
