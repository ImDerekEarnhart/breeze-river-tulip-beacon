export { SMOKE_ITEMS, SMOKE_SUITE_ID, type SmokeItem } from "./items.ts";
export {
  EDUCATION_FAILURE_KINDS,
  matchSmokeItem,
  normalizeLabel,
  scoreAnswer,
  type EducationFailureKind,
  type EducationScore,
} from "./score.ts";
export { studentOnlyExamGate, type StudentOnlyExamGate } from "./gate.ts";
export {
  admitTeacherCorrection,
  type CorrectionStatus,
  type CorrectionVerdict,
} from "./quarantine.ts";
