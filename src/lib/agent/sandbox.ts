import { spawn } from "node:child_process";

const BANNED =
  /\b(os|sys|subprocess|socket|pathlib|shutil|requests|http|urllib|ctypes|multiprocessing|pty|fcntl|importlib|builtins|eval|exec|open|compile|__import__|globals|locals|input|file|breakpoint)\b/i;

function looksDangerous(code: string) {
  if (code.length > 3500) return "Code exceeds sandbox limit.";
  if (BANNED.test(code)) return "Policy engine blocked a disallowed name.";
  if (/[\\/]etc[\\/]|[\\/]proc[\\/]|[\\/]sys[\\/]/.test(code)) {
    return "Policy engine blocked a filesystem path.";
  }
  return null;
}

function runPythonProcess(code: string): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(
      "python3",
      ["-I", "-c", "import sys; exec(sys.stdin.read(), {'__name__':'__sandbox__'})"],
      {
        timeout: 2500,
        env: { PATH: "/usr/bin:/bin", LANG: "C.UTF-8" },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d: Buffer) => {
      out += d.toString();
    });
    child.stderr.on("data", (d: Buffer) => {
      err += d.toString();
    });
    child.on("error", (e) => {
      resolve({ ok: false, output: e.message });
    });
    child.on("close", (codeExit) => {
      const text = `${out}${err ? (out ? "\n" : "") + err : ""}`.trim();
      resolve({
        ok: codeExit === 0,
        output: (text || `(exit ${codeExit})`).slice(0, 6000),
      });
    });
    child.stdin.write(code);
    child.stdin.end();
  });
}

function jsMathFallback(code: string): { ok: boolean; output: string } {
  const expr = code
    .replace(/print\((.*)\)/gs, "$1")
    .replace(/\*\*/g, "^")
    .trim();
  const safe = /^[0-9+\-*/^().,\s]+$/.test(expr.replace(/\^/g, "**"));
  if (!safe) {
    return {
      ok: false,
      output: "Sandbox worker unavailable; only arithmetic could be evaluated locally.",
    };
  }
  try {
    const js = expr.replace(/\^/g, "**");
    const value = Function(`"use strict"; return (${js});`)();
    return { ok: true, output: String(value) };
  } catch (e) {
    return { ok: false, output: e instanceof Error ? e.message : "eval failed" };
  }
}

export async function runSandbox(code: string): Promise<{ ok: boolean; output: string }> {
  const blocked = looksDangerous(code);
  if (blocked) return { ok: false, output: blocked };
  try {
    const result = await runPythonProcess(code);
    if (result.ok || result.output) return result;
  } catch {
    /* fall through */
  }
  return jsMathFallback(code);
}
