/** Pure student-only exam gate. Teacher substitution is not representable. */

export type StudentOnlyExamGate = {
  path: "student" | "fail_closed";
  reason: "fast_path" | "student_unconfigured";
  teacherSubstituted: false;
};

export function studentOnlyExamGate(studentConfigured: boolean): StudentOnlyExamGate {
  if (!studentConfigured) {
    return {
      path: "fail_closed",
      reason: "student_unconfigured",
      teacherSubstituted: false,
    };
  }
  return {
    path: "student",
    reason: "fast_path",
    teacherSubstituted: false,
  };
}
