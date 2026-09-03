import { sha256 } from "./orbita.ts";
import {
  canonicalUnsigned,
  lastReceiptParents,
  unsignedReceiptBody,
  type ProposalAction,
  type ProposalRole,
  type ReceiptDraft,
  type ReceiptEnvelope,
} from "./receipts.ts";

export function hashText(text: string): string {
  return sha256(text);
}

export function makeReceipt(draft: ReceiptDraft): ReceiptEnvelope {
  const body = unsignedReceiptBody(draft);
  return { ...body, hash: sha256(canonicalUnsigned(draft)) };
}

export function emitReceipt(
  receipts: ReceiptEnvelope[],
  draft: Omit<ReceiptDraft, "parentReceiptIds"> & { parentReceiptIds?: string[] },
): ReceiptEnvelope {
  const rec = makeReceipt({
    ...draft,
    parentReceiptIds: draft.parentReceiptIds ?? lastReceiptParents(receipts),
  });
  receipts.push(rec);
  return rec;
}

/** Proposal receipts never freeze or approve. Core remains the Control plane. */
export function emitProposal(
  receipts: ReceiptEnvelope[],
  draft: {
    id: string;
    runId: string;
    producer: string;
    createdAt: number;
    provenance: string[];
    parentReceiptIds?: string[];
    summary: string;
    candidateCount?: number;
    action: ProposalAction;
    role: ProposalRole;
    candidateHash?: string;
  },
): ReceiptEnvelope {
  return emitReceipt(receipts, {
    id: draft.id,
    kind: "proposal",
    runId: draft.runId,
    producer: draft.producer,
    createdAt: draft.createdAt,
    provenance: draft.provenance,
    parentReceiptIds: draft.parentReceiptIds,
    payload: {
      type: "proposal",
      summary: draft.summary.slice(0, 280),
      candidateCount: draft.candidateCount ?? 1,
      action: draft.action,
      role: draft.role,
      coreApproved: false,
      ...(draft.candidateHash ? { candidateHash: draft.candidateHash } : {}),
    },
  });
}
