import { apiKeyFor, redactSecrets } from "./config.server";
import type { ChatRequest, ChatResult, ModelProvider, RoleConfig, TokenUsage } from "./types";

type InFlight = { n: number };

function usageOf(raw: unknown): TokenUsage {
  const u = (raw as { usage?: Record<string, unknown> } | null)?.usage;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    promptTokens: num(u?.prompt_tokens),
    completionTokens: num(u?.completion_tokens),
    totalTokens: num(u?.total_tokens),
  };
}

export class OpenAICompatibleProvider implements ModelProvider {
  readonly role: "student" | "teacher";
  readonly config: RoleConfig;
  private inflight: InFlight = { n: 0 };

  constructor(config: RoleConfig) {
    this.role = config.role;
    this.config = config;
  }

  async chat(req: ChatRequest): Promise<ChatResult> {
    const started = Date.now();
    const model = this.config.modelId || "unspecified";
    if (!this.config.configured) {
      return {
        ok: false,
        error: `${this.role} provider is not configured (no base URL).`,
        code: "not_configured",
        provider: this.config.provider,
        model,
        latencyMs: Date.now() - started,
      };
    }
    if (this.inflight.n >= this.config.maxConcurrency) {
      return {
        ok: false,
        error: `${this.role} concurrency limit (${this.config.maxConcurrency}) reached.`,
        code: "fail_closed",
        provider: this.config.provider,
        model,
        latencyMs: Date.now() - started,
      };
    }

    const key = apiKeyFor(this.config);
    const url = `${this.config.baseUrl}/chat/completions`;
    const body: Record<string, unknown> = {
      model,
      messages: req.messages,
      max_tokens: req.maxTokens ?? this.config.maxOutputTokens,
      temperature: req.temperature ?? this.config.temperature,
    };
    if (req.json) body.response_format = { type: "json_object" };

    const timeoutMs = req.timeoutMs ?? this.config.timeoutSeconds * 1000;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    this.inflight.n += 1;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (key) headers.Authorization = `Bearer ${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const rawText = await res.text();
      if (!res.ok) {
        return {
          ok: false,
          error: redactSecrets(`${this.config.baseHost} HTTP ${res.status}: ${rawText.slice(0, 240)}`),
          code: "http",
          provider: this.config.provider,
          model,
          latencyMs: Date.now() - started,
        };
      }
      let data: {
        choices?: { message?: { content?: string } }[];
        model?: string;
        usage?: unknown;
      };
      try {
        data = JSON.parse(rawText) as typeof data;
      } catch {
        return {
          ok: false,
          error: "Provider returned non-JSON body",
          code: "parse",
          provider: this.config.provider,
          model,
          latencyMs: Date.now() - started,
        };
      }
      const text = data.choices?.[0]?.message?.content ?? "";
      return {
        ok: true,
        text,
        model: data.model ?? model,
        provider: this.config.provider,
        usage: usageOf(data),
        latencyMs: Date.now() - started,
      };
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      return {
        ok: false,
        error: redactSecrets(
          aborted ? `${this.role} timed out after ${timeoutMs}ms` : e instanceof Error ? e.message : "fetch failed",
        ),
        code: aborted ? "timeout" : "http",
        provider: this.config.provider,
        model,
        latencyMs: Date.now() - started,
      };
    } finally {
      clearTimeout(timer);
      this.inflight.n -= 1;
    }
  }
}
