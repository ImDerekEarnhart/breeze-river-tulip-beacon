import { deriveHealthUrl } from "../hodgeform/protocol";
import { redactSecrets, studentConfig } from "./config.server";

export type HealthProbe = {
  configured: boolean;
  urlHost: string;
  ok: boolean;
  status: number | null;
  latencyMs: number;
  models: string[];
  error?: string;
};

function hostOf(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

async function getJson(url: string, timeoutMs: number): Promise<{
  status: number;
  json: unknown;
  raw: string;
  contentType: string;
}> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
      redirect: "manual",
    });
    const raw = await res.text();
    let json: unknown = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }
    return { status: res.status, json, raw: raw.slice(0, 240), contentType: res.headers.get("content-type") ?? "" };
  } finally {
    clearTimeout(timer);
  }
}

export async function probeStudentHealth(): Promise<HealthProbe> {
  const cfg = studentConfig();
  const url = deriveHealthUrl(cfg.baseUrl, cfg.healthUrl);
  const started = Date.now();
  if (!cfg.configured || !url) {
    return {
      configured: false,
      urlHost: "",
      ok: false,
      status: null,
      latencyMs: 0,
      models: [],
      error: "Student health URL is unset. Set STUDENT_BASE_URL and optionally STUDENT_HEALTH_URL.",
    };
  }
  try {
    const res = await getJson(url, 4000);
    const modelsRaw = (res.json as { data?: { id?: string }[] } | null)?.data ?? [];
    const models = modelsRaw.map((m) => String(m.id ?? "")).filter(Boolean).slice(0, 8);
    const ok = res.status >= 200 && res.status < 300;
    return {
      configured: true,
      urlHost: hostOf(url),
      ok,
      status: res.status,
      latencyMs: Date.now() - started,
      models,
      error: ok ? undefined : redactSecrets(`health HTTP ${res.status}: ${res.raw}`),
    };
  } catch (e) {
    return {
      configured: true,
      urlHost: hostOf(url),
      ok: false,
      status: null,
      latencyMs: Date.now() - started,
      models: [],
      error: redactSecrets(e instanceof Error ? e.message : "health probe failed"),
    };
  }
}

export async function probeHodgeformUiHealth(url: string): Promise<{
  ok: boolean;
  host: string;
  service?: string;
  version?: string;
  latencyMs: number;
  error?: string;
}> {
  const started = Date.now();
  if (!url) {
    return { ok: false, host: "", latencyMs: 0, error: "No UI health URL" };
  }
  try {
    const res = await getJson(url, 4000);
    const body = (res.json ?? {}) as { status?: string; service?: string; version?: string };
    const ok = res.status >= 200 && res.status < 300 && (body.status === "ok" || body.status === undefined);
    return {
      ok,
      host: hostOf(url),
      service: body.service,
      version: body.version,
      latencyMs: Date.now() - started,
      error: ok ? undefined : redactSecrets(`UI health HTTP ${res.status}`),
    };
  } catch (e) {
    return {
      ok: false,
      host: hostOf(url),
      latencyMs: Date.now() - started,
      error: redactSecrets(e instanceof Error ? e.message : "UI health failed"),
    };
  }
}
