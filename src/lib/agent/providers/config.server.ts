import { deriveHealthUrl } from "../hodgeform/protocol";
import { hodgeformAuthMode } from "../hodgeform/oauth.server";
import type { PublicRoleStatus, RoleConfig } from "./types";

function env(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

function envInt(name: string, fallback: number): number {
  const n = Number(env(name));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function hostOf(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function isXai(url: string): boolean {
  return /api\.x\.ai/i.test(url);
}

function roleConfig(role: "student" | "teacher"): RoleConfig {
  const prefix = role === "student" ? "STUDENT" : "TEACHER";
  const xaiKey = env("XAI_API_KEY");
  const explicitUrl = env(`${prefix}_BASE_URL`);
  // Student is the GPU/vLLM worker. Do not silently substitute Grok.
  const baseUrl =
    role === "student"
      ? explicitUrl
      : explicitUrl || (xaiKey ? "https://api.x.ai/v1" : "");
  const provider =
    env(`${prefix}_PROVIDER`) ||
    (baseUrl ? (isXai(baseUrl) ? "xai" : "openai-compatible") : "none");
  const modelId =
    env(`${prefix}_MODEL_ID`) || (isXai(baseUrl) ? "grok-4.5" : "");
  const modelRevision = env(`${prefix}_MODEL_REVISION`);
  const healthUrl = deriveHealthUrl(baseUrl, env(`${prefix}_HEALTH_URL`));
  const failClosed =
    env(`${prefix}_FAIL_CLOSED`, role === "student" || (explicitUrl && !isXai(explicitUrl)) ? "true" : "false") ===
    "true";

  return {
    role,
    provider,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    modelId,
    modelRevision,
    healthUrl,
    timeoutSeconds: envInt(`${prefix}_TIMEOUT_SECONDS`, role === "student" ? 45 : 90),
    maxOutputTokens: envInt(
      `${prefix}_MAX_OUTPUT_TOKENS`,
      role === "student" ? 500 : 900,
    ),
    temperature: Number(env(`${prefix}_TEMPERATURE`, role === "student" ? "0.2" : "0.3")),
    maxConcurrency: envInt(`${prefix}_MAX_CONCURRENCY`, 2),
    contextWindow: envInt(`${prefix}_CONTEXT_WINDOW`, 8192),
    failClosed,
    configured: Boolean(baseUrl),
    baseHost: hostOf(baseUrl),
    healthHost: hostOf(healthUrl),
  };
}

export function studentConfig(): RoleConfig {
  return roleConfig("student");
}

export function teacherConfig(): RoleConfig {
  return roleConfig("teacher");
}

export function apiKeyFor(cfg: RoleConfig): string {
  const prefix = cfg.role === "student" ? "STUDENT" : "TEACHER";
  return env(`${prefix}_API_KEY`) || (isXai(cfg.baseUrl) ? env("XAI_API_KEY") : "");
}

export function teacherBudgetUsdPerRun(): number | null {
  const n = Number(env("TEACHER_BUDGET_USD_PER_RUN"));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function mcpConfig() {
  const url = env("HODGEFORM_MCP_URL", "https://staging.hodgeform.com/mcp");
  const tokenUrl = env("HODGEFORM_TOKEN_URL");
  const uiHealthUrl = env("HODGEFORM_UI_HEALTH_URL", "https://staging.hodgeform.com/health");
  const mode = hodgeformAuthMode();
  return {
    url,
    host: hostOf(url),
    tokenUrl,
    tokenUrlHost: hostOf(tokenUrl),
    uiHealthUrl,
    uiHealthHost: hostOf(uiHealthUrl),
    authMode: mode,
    tokenPresent: mode !== "missing",
  };
}

export function publicRoleStatus(cfg: RoleConfig): PublicRoleStatus {
  return {
    role: cfg.role,
    configured: cfg.configured,
    provider: cfg.provider,
    baseHost: cfg.baseHost,
    healthHost: cfg.healthHost,
    modelIdConfigured: cfg.modelId,
    modelRevision: cfg.modelRevision,
    failClosed: cfg.failClosed,
  };
}

/** Strip secrets from strings that may be logged or returned to the UI. */
export function redactSecrets(text: string): string {
  let out = text;
  const secrets = [
    env("XAI_API_KEY"),
    env("STUDENT_API_KEY"),
    env("TEACHER_API_KEY"),
    env("HODGEFORM_MCP_ACCESS_TOKEN"),
    env("HODGEFORM_CLIENT_SECRET"),
  ];
  for (const s of secrets) {
    if (s && s.length >= 8) out = out.split(s).join("[redacted]");
  }
  out = out.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
  return out;
}
