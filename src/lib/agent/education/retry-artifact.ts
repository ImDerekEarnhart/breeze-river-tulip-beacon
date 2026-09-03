import { ARCHITECTURE_LOOP, FALSIFIERS } from "../roles.ts";

/** Disk form of the RETRY artifact Core named. Not submitted. Guided did not advance the loop. */
export const RETRY_ARTIFACT = {
  schema: "guided-retry-artifact/1",
  submitted: false,
  loopId: ARCHITECTURE_LOOP.loopId,
  expected_state: "RETRY",
  expected_previous_event_hash: ARCHITECTURE_LOOP.latestEventHash,
  retry_authorized: true,
  change_summary:
    "Local education verifier added: exact semantic-label scoring on an operator-visible English smoke suite; student-only exam fail-closes without the teacher; teacher corrections stay quarantined until this scorer passes them; an NLP miss cannot issue LANGUAGE_LIMIT. Fast-path shallow verify remains for unmatched requests (still VERIFIER_LIMIT). Activation false. Not Core.",
  retained_falsifiers: FALSIFIERS.map((f) => f.id),
  diagnosedLimitation: ARCHITECTURE_LOOP.diagnosedLimitation,
  repairKind: ARCHITECTURE_LOOP.repairKind,
  candidateHash: ARCHITECTURE_LOOP.candidateHash,
  activationRequested: false,
  coreApproved: false,
  note: "candidateHash is the Core-supplied identifier. It is not the SHA-256 of these files.",
} as const;
