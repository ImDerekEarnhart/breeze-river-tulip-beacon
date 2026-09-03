import type { CorrectionStatus } from "../types.ts";
import { matchSmokeItem, scoreAnswer } from "./score.ts";

export type { CorrectionStatus };

export type CorrectionVerdict = {
  status: CorrectionStatus;
  educationPass: boolean | null;
  reason: string;
  languageLimit: false;
  coreApproved: false;
};

/** Teacher answers stay inert until this independent scorer passes them. No expected label → stay quarantined. */
export function admitTeacherCorrection(opts: {
  prompt: string;
  teacherAnswer: string;
  confidence?: number;
}): CorrectionVerdict {
  const item = matchSmokeItem(opts.prompt);
  if (!item) {
    return {
      status: "quarantined",
      educationPass: null,
      reason: "No expected label. Teacher correction stays quarantined. Not Core.",
      languageLimit: false,
      coreApproved: false,
    };
  }
  const scored = scoreAnswer(opts.teacherAnswer, item, opts.confidence ?? 0);
  if (scored.pass) {
    return {
      status: "local_pass",
      educationPass: true,
      reason: `${scored.reason}. Local smoke exam only — not Hodgeform Core admission.`,
      languageLimit: false,
      coreApproved: false,
    };
  }
  return {
    status: "local_fail",
    educationPass: false,
    reason: scored.reason,
    languageLimit: false,
    coreApproved: false,
  };
}
