import { hashArtifact } from "./hash.server.ts";
import type {
  AdmissionRecord,
  CandidateDelta,
  ExternalAdmissionProjection,
} from "./types.ts";

export function projectExternalAdmission(
  candidate: CandidateDelta,
  projection: ExternalAdmissionProjection,
): AdmissionRecord {
  if (projection.candidateHash !== candidate.candidateHash) {
    throw new Error("Admission projection is not bound to the exact candidate hash");
  }
  if (!projection.reviewRef.trim()) throw new Error("External review reference is required");
  if (!projection.reviewer.trim()) throw new Error("External reviewer identity is required");
  if (projection.reviewer === candidate.proposedBy) {
    throw new Error("Candidate proposer cannot self-review a semantic delta");
  }
  const normalized = Object.freeze({
    ...projection,
    evidenceHashes: Object.freeze([...projection.evidenceHashes].sort()),
    limitations: Object.freeze([...projection.limitations]),
  });
  return Object.freeze({
    projection: normalized,
    admissionRecordHash: hashArtifact(normalized),
  });
}
