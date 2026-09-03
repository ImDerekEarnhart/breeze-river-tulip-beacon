export type HodgeformAuthMode = "missing" | "static_token" | "client_credentials";

type TokenCache = { token: string; expiresAt: number };
let cache: TokenCache | null = null;

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function redact(text: string): string {
  let out = text;
  const secret = env("HODGEFORM_CLIENT_SECRET");
  if (secret && secret.length >= 8) out = out.split(secret).join("[redacted]");
  return out.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
}

export function hodgeformAuthMode(): HodgeformAuthMode {
  if (env("HODGEFORM_MCP_ACCESS_TOKEN")) return "static_token";
  if (env("HODGEFORM_CLIENT_ID") && env("HODGEFORM_CLIENT_SECRET") && env("HODGEFORM_TOKEN_URL")) {
    return "client_credentials";
  }
  return "missing";
}

export type HodgeformToken =
  | { token: string; mode: HodgeformAuthMode }
  | { token: ""; mode: HodgeformAuthMode; error: string };

export async function getHodgeformAccessToken(): Promise<HodgeformToken> {
  const mode = hodgeformAuthMode();
  if (mode === "static_token") {
    return { token: env("HODGEFORM_MCP_ACCESS_TOKEN"), mode };
  }
  if (mode !== "client_credentials") {
    return {
      token: "",
      mode: "missing",
      error:
        "No tenant-bound server credential. Set HODGEFORM_MCP_ACCESS_TOKEN or HODGEFORM_CLIENT_ID + HODGEFORM_CLIENT_SECRET + HODGEFORM_TOKEN_URL. Browser cookies and VITE_ keys are refused.",
    };
  }

  if (cache && cache.expiresAt > Date.now() + 5000) {
    return { token: cache.token, mode };
  }

  const tokenUrl = env("HODGEFORM_TOKEN_URL");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env("HODGEFORM_CLIENT_ID"),
    client_secret: env("HODGEFORM_CLIENT_SECRET"),
  });
  const scope = env("HODGEFORM_OAUTH_SCOPE");
  if (scope) body.set("scope", scope);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      redirect: "manual",
      signal: ctrl.signal,
    });
    const raw = await res.text();
    const ct = res.headers.get("content-type") ?? "";
    if (/text\/html/i.test(ct) || /<!doctype html/i.test(raw) || res.status === 301 || res.status === 302) {
      return {
        token: "",
        mode,
        error:
          "Token URL returned a login page. Use a machine client-credentials endpoint, not browser OAuth.",
      };
    }
    if (!res.ok) {
      return { token: "", mode, error: redact(`token HTTP ${res.status}: ${raw.slice(0, 180)}`) };
    }
    let json: { access_token?: string; expires_in?: number };
    try {
      json = JSON.parse(raw) as typeof json;
    } catch {
      return { token: "", mode, error: "Token response was not JSON" };
    }
    if (!json.access_token) {
      return { token: "", mode, error: "Token response had no access_token" };
    }
    const ttl = typeof json.expires_in === "number" && json.expires_in > 60 ? json.expires_in : 300;
    cache = { token: json.access_token, expiresAt: Date.now() + ttl * 1000 };
    return { token: json.access_token, mode };
  } catch (e) {
    return {
      token: "",
      mode,
      error: redact(e instanceof Error ? e.message : "token fetch failed"),
    };
  } finally {
    clearTimeout(timer);
  }
}
