import { studentAvailable, studentChat, studentProvider } from "../providers/index.server.ts";
import { studentOnlyExamGate } from "./gate.ts";
import { SMOKE_ITEMS, SMOKE_SUITE_ID } from "./items.ts";
import { scoreAnswer } from "./score.ts";
import type { EducationScore } from "./score.ts";

export type ExamItemResult = {
  id: string;
  prompt: string;
  answer: string;
  score: EducationScore;
};

export type StudentOnlyExamResult = {
  suite: typeof SMOKE_SUITE_ID;
  ok: boolean;
  teacherCalled: false;
  teacherSubstituted: false;
  languageLimit: false;
  gate: ReturnType<typeof studentOnlyExamGate>;
  message: string;
  studentModel?: string;
  results: ExamItemResult[];
};

function parseLooseAnswer(raw: string): { answer: string; confidence: number } {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const obj = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
      return {
        answer: String(obj.answer ?? obj.text ?? trimmed),
        confidence: Math.max(0, Math.min(1, Number(obj.confidence ?? 0))),
      };
    } catch {
      /* fall through */
    }
  }
  return { answer: trimmed, confidence: 0 };
}

/** Student-only. If the student is missing this fail-closes and does not call the teacher. */
export async function runStudentOnlyExam(): Promise<StudentOnlyExamResult> {
  const gate = studentOnlyExamGate(studentAvailable());
  if (gate.path === "fail_closed") {
    return {
      suite: SMOKE_SUITE_ID,
      ok: false,
      teacherCalled: false,
      teacherSubstituted: false,
      languageLimit: false,
      gate,
      message:
        "Student-only English smoke exam fail-closed. Student is not configured. Teacher was not called. Not LANGUAGE_LIMIT.",
      results: [],
    };
  }

  const results: ExamItemResult[] = [];
  let studentModel: string | undefined;
  for (const item of SMOKE_ITEMS) {
    const res = await studentChat([
      {
        role: "system",
        content:
          'Answer in one short sentence. JSON only: {"answer":"...","confidence":0-1}. You are the worker role, not Grok, not Hodgeform Core.',
      },
      { role: "user", content: item.prompt },
    ]);
    if (!res.ok) {
      return {
        suite: SMOKE_SUITE_ID,
        ok: false,
        teacherCalled: false,
        teacherSubstituted: false,
        languageLimit: false,
        gate: { path: "fail_closed", reason: "student_unconfigured", teacherSubstituted: false },
        message: `Student provider fail-closed during smoke exam: ${res.error}. Teacher was not called.`,
        studentModel: res.model,
        results,
      };
    }
    studentModel = res.model;
    const parsed = parseLooseAnswer(res.text);
    results.push({
      id: item.id,
      prompt: item.prompt,
      answer: parsed.answer,
      score: scoreAnswer(parsed.answer, item, parsed.confidence),
    });
  }

  const passed = results.every((r) => r.score.pass);
  return {
    suite: SMOKE_SUITE_ID,
    ok: passed,
    teacherCalled: false,
    teacherSubstituted: false,
    languageLimit: false,
    gate,
    message: passed
      ? `Local smoke exam passed on ${studentProvider().config.modelId}. Not a held-out benchmark. Not Core.`
      : `Local smoke exam failed ${results.filter((r) => !r.score.pass).length}/${results.length} items. Teacher was not called. Not LANGUAGE_LIMIT.`,
    studentModel,
    results,
  };
}
