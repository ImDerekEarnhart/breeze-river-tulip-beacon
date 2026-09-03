export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type TokenUsage = {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
};

export type ChatSuccess = {
  ok: true;
  text: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  latencyMs: number;
};

export type ChatFailure = {
  ok: false;
  error: string;
  code: "not_configured" | "timeout" | "http" | "parse" | "fail_closed";
  provider: string;
  model: string;
  latencyMs: number;
};

export type ChatResult = ChatSuccess | ChatFailure;

export type ChatRequest = {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  timeoutMs?: number;
};

export type RoleConfig = {
  role: "student" | "teacher";
  provider: string;
  baseUrl: string;
  modelId: string;
  modelRevision: string;
  healthUrl: string;
  timeoutSeconds: number;
  maxOutputTokens: number;
  temperature: number;
  maxConcurrency: number;
  contextWindow: number;
  failClosed: boolean;
  configured: boolean;
  /** Hostname only — never the key, never the full credentialed URL. */
  baseHost: string;
  healthHost: string;
};

export interface ModelProvider {
  readonly role: "student" | "teacher";
  readonly config: RoleConfig;
  chat(req: ChatRequest): Promise<ChatResult>;
}

export type PublicRoleStatus = {
  role: "student" | "teacher";
  configured: boolean;
  provider: string;
  baseHost: string;
  healthHost: string;
  modelIdConfigured: string;
  modelRevision: string;
  failClosed: boolean;
};
