import { publicRoleStatus, studentConfig, teacherConfig } from "./config.server";
import { OpenAICompatibleProvider } from "./openai-compatible.server";
import type { ChatMessage, ChatResult, ModelProvider } from "./types";

let student: ModelProvider | null = null;
let teacher: ModelProvider | null = null;

export function studentProvider(): ModelProvider {
  student ??= new OpenAICompatibleProvider(studentConfig());
  return student;
}

export function teacherProvider(): ModelProvider {
  teacher ??= new OpenAICompatibleProvider(teacherConfig());
  return teacher;
}

export function studentChat(
  messages: ChatMessage[],
  opts?: { maxTokens?: number },
): Promise<ChatResult> {
  return studentProvider().chat({
    messages,
    maxTokens: opts?.maxTokens,
    json: true,
  });
}

export function teacherChat(
  messages: ChatMessage[],
  opts?: { maxTokens?: number; json?: boolean },
): Promise<ChatResult> {
  return teacherProvider().chat({
    messages,
    maxTokens: opts?.maxTokens,
    json: opts?.json ?? true,
  });
}

export function studentAvailable(): boolean {
  return studentProvider().config.configured;
}

export function teacherAvailable(): boolean {
  return teacherProvider().config.configured;
}

export function providerPublicStatus() {
  return {
    student: publicRoleStatus(studentProvider().config),
    teacher: publicRoleStatus(teacherProvider().config),
  };
}

export type { ChatMessage, ChatResult };
