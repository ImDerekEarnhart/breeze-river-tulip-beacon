import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Calculator, Folder, Globe, Power, Square, Terminal } from "lucide-react";
import { DESK_H, DESK_W, IDLE_SECONDS, type DeskApp } from "@/lib/desktop";
import { useDesktop } from "@/lib/desktop-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APPS: { id: DeskApp; label: string; Icon: typeof Globe }[] = [
  { id: "chromium", label: "Chromium", Icon: Globe },
  { id: "files", label: "Files", Icon: Folder },
  { id: "terminal", label: "Terminal", Icon: Terminal },
  { id: "calculator", label: "Calc", Icon: Calculator },
];

export function DesktopView() {
  const snap = useDesktop((s) => s.snap);
  const log = useDesktop((s) => s.log);
  const start = useDesktop((s) => s.start);
  const finishBoot = useDesktop((s) => s.finishBoot);
  const stop = useDesktop((s) => s.stop);
  const command = useDesktop((s) => s.command);

  useEffect(() => {
    if (snap.status !== "booting") return;
    const t = window.setTimeout(() => finishBoot(), 1600);
    return () => window.clearTimeout(t);
  }, [snap.status, finishBoot]);

  const remaining = useIdleRemaining(snap.status === "running" ? snap.lastActive : 0);

  useEffect(() => {
    if (snap.status === "running" && remaining === 0 && snap.lastActive > 0) {
      stop();
    }
  }, [remaining, snap.status, snap.lastActive, stop]);

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] md:min-h-dvh md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
      <section className="px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
              Simulated · not a cloud VM
            </p>
            <h1 className="mt-1 font-display text-3xl tracking-tight">PocketDesktop</h1>
            <p className="mt-1 max-w-md text-sm text-muted">
              In-app canvas only. No GCP instance, noVNC, or Tailscale. Phase 5
              adapter — not Hodgeform Core.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={snap.status} />
            {snap.status === "stopped" ? (
              <Button onClick={start}>
                <Power className="size-4" />
                Start
              </Button>
            ) : (
              <Button variant="secondary" onClick={stop}>
                <Square className="size-4" />
                Stop
              </Button>
            )}
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:grid-cols-4">
          <Meta label="Machine" value="e2-standard-2" />
          <Meta label="Disk" value="35 GB" />
          <Meta label="Exposure" value="Tailscale only" />
          <Meta label="Idle halt" value={formatRemain(remaining)} />
        </dl>

        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-2 md:p-3">
          <XfceScreen />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          1440×900 · Xvfb :1 · noVNC :6080 · localhost VNC
        </p>
      </section>

      <aside className="border-t border-border px-4 py-4 md:border-l md:border-t-0 md:px-5 md:py-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          Narrow API
        </div>
        <h2 className="mt-1 text-sm text-fg">Logged actions</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Allow-list: chromium, files, terminal, calculator. Policy denies sudo,
          shell escapes, and anything not on that list.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={snap.status !== "running"}
            onClick={() => command({ action: "screenshot" })}
          >
            Screenshot
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={snap.status !== "running"}
            onClick={() => command({ action: "launch", app: "terminal" })}
          >
            Launch tty
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={snap.status !== "running"}
            onClick={() => {
              command({ action: "launch", app: "terminal" });
              command({ action: "type", text: "sudo bash" });
            }}
          >
            Try sudo
          </Button>
        </div>
        <ol className="mt-4 space-y-2">
          {log.length === 0 && (
            <li className="text-sm text-muted">No actions yet. Start the VM.</li>
          )}
          {log.map((row) => (
            <li key={row.id} className="rounded-[var(--radius-sm)] border border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {row.kind}
                </span>
                <Badge tone={row.ok ? "ok" : "fail"}>{row.ok ? "ok" : "deny"}</Badge>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{row.detail}</p>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border px-2 py-2">
      <dt className="text-subtle">{label}</dt>
      <dd className="mt-0.5 text-fg">{value}</dd>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone =
    status === "running" ? "ok" : status === "booting" ? "warn" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

function formatRemain(sec: number) {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function useIdleRemaining(lastActive: number) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (!lastActive || !now) return IDLE_SECONDS;
  return Math.max(0, IDLE_SECONDS - Math.floor((now - lastActive) / 1000));
}

function XfceScreen() {
  const snap = useDesktop((s) => s.snap);
  const command = useDesktop((s) => s.command);
  const focus = useDesktop((s) => s.focus);
  const close = useDesktop((s) => s.close);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`,
      );
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  function onCanvasClick(e: MouseEvent<HTMLDivElement>) {
    if (snap.status !== "running") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * DESK_W;
    const y = ((e.clientY - rect.top) / rect.height) * DESK_H;
    command({ action: "click", x, y });
  }

  return (
    <div
      className="relative aspect-[1440/900] w-full overflow-hidden rounded-[var(--radius-sm)]"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="absolute inset-0"
        onClick={onCanvasClick}
        role="presentation"
      >
        <div className="xfce-wall absolute inset-0" />
        {snap.status === "running" && (
          <div className="absolute left-3 top-10 flex flex-col gap-3">
            {APPS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  focus(a.id);
                }}
                className="flex w-16 flex-col items-center gap-1"
              >
                <span className="flex size-9 items-center justify-center rounded-[var(--radius-xs)] border border-border-strong bg-bg-elevated">
                  <a.Icon className="size-3.5 text-muted" strokeWidth={1.6} />
                </span>
                <span className="text-[10px] text-fg">{a.label}</span>
              </button>
            ))}
          </div>
        )}

        {snap.status === "running" &&
          snap.windows
            .filter((w) => w.open)
            .map((w) => (
              <WindowFrame
                key={w.id}
                app={w.id}
                x={w.x}
                y={w.y}
                ww={w.w}
                hh={w.h}
                focused={snap.focused === w.id}
                onClose={() => close(w.id)}
                onFocus={() => focus(w.id)}
              >
                <WindowBody
                  app={w.id}
                  term={snap.term}
                  title={snap.chromiumTitle}
                  calc={snap.calc ?? "0"}
                />
              </WindowFrame>
            ))}

        {snap.status === "running" && (
          <div
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg bg-accent/80"
            style={{
              left: `${(snap.pointerX / DESK_W) * 100}%`,
              top: `${(snap.pointerY / DESK_H) * 100}%`,
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 flex h-8 items-center gap-1 border-t border-border bg-bg-elevated/95 px-1">
          <span className="px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            Applications
          </span>
          {APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={cn(
                "h-6 rounded-[4px] px-2 font-mono text-[10px] uppercase tracking-[0.08em]",
                snap.focused === a.id ? "bg-bg-subtle text-fg" : "text-muted",
              )}
              onClick={(e) => {
                e.stopPropagation();
                focus(a.id);
              }}
            >
              {a.label}
            </button>
          ))}
          <span className="ml-auto pr-2 font-mono text-[10px] tabular-nums text-muted">
            {clock}
          </span>
        </div>
      </div>

      {snap.status !== "running" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg/90 px-6 text-center">
          {snap.status === "booting" ? (
            <>
              <p className="shimmer-text font-mono text-xs">systemd · starting XFCE…</p>
              <p className="mt-2 font-mono text-[10px] text-subtle">
                display :1 · vnc 5900 · web 6080
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl">VM stopped</p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Start PocketDesktop to give Orbita a governed screen. Chromium
                autostarts. Root is not on the allow-list.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function WindowFrame({
  app,
  x,
  y,
  ww,
  hh,
  focused,
  onClose,
  onFocus,
  children,
}: {
  app: DeskApp;
  x: number;
  y: number;
  ww: number;
  hh: number;
  focused: boolean;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute flex flex-col overflow-hidden rounded-[4px] border bg-bg-elevated shadow-[var(--shadow-soft)]",
        focused ? "border-fg/35 z-10" : "border-border z-[1]",
      )}
      style={{
        left: `${(x / DESK_W) * 100}%`,
        top: `${(y / DESK_H) * 100}%`,
        width: `${(ww / DESK_W) * 100}%`,
        height: `${(hh / DESK_H) * 100}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onFocus();
      }}
    >
      <div className="flex h-6 shrink-0 items-center border-b border-border px-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {app}
        </span>
        <button
          type="button"
          className="ml-auto size-4 rounded-full border border-border text-[8px] text-muted"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${app}`}
        >
          ×
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function WindowBody({
  app,
  term,
  title,
  calc,
}: {
  app: DeskApp;
  term: string;
  title: string;
  calc: string;
}) {
  const files = useMemo(
    () => [
      "README.md",
      "deploy-pocketdesktop.sh",
      "pocketdesktop-vm.sh",
      "startup-pocketdesktop.sh",
    ],
    [],
  );
  const command = useDesktop((s) => s.command);
  if (app === "chromium") {
    return (
      <div className="flex h-full flex-col bg-bg">
        <div className="border-b border-border px-2 py-1 font-mono text-[10px] text-subtle">
          https://orbita.local/
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="font-display text-lg text-fg">Orbita</div>
          <p className="mt-1 text-[11px] text-muted">{title}</p>
          <p className="mt-3 max-w-[14rem] text-center text-[10px] leading-relaxed text-subtle">
            Chromium autostart. Tailscale serve only. This is a desktop target, not a
            root session.
          </p>
        </div>
      </div>
    );
  }
  if (app === "terminal") {
    return (
      <pre className="h-full bg-bg p-2 font-mono text-[10px] leading-relaxed text-ok">
        {term}
        <span className="pipeline-live">█</span>
      </pre>
    );
  }
  if (app === "files") {
    return (
      <ul className="grid grid-cols-2 gap-1 p-2">
        {files.map((f) => (
          <li
            key={f}
            className="rounded-[4px] border border-border px-2 py-2 font-mono text-[10px] text-muted"
          >
            {f}
          </li>
        ))}
      </ul>
    );
  }
  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "="];
  return (
    <div className="flex h-full flex-col bg-bg p-2">
      <div className="mb-2 rounded-[4px] border border-border px-2 py-1 text-right font-mono text-sm tabular-nums">
        {calc || "0"}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {keys.map((n) => (
          <button
            key={n}
            type="button"
            className="flex h-7 items-center justify-center rounded-[4px] border border-border font-mono text-xs text-muted"
            onClick={(e) => {
              e.stopPropagation();
              if (n === "=") return;
              command({ action: "type", text: `${calc === "0" ? "" : calc}${n}` });
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
