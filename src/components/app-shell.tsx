import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Database,
  FlaskConical,
  GitBranch,
  Layers,
  MessageSquare,
  Monitor,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { placeFromPath } from "@/lib/world";
import { useWorld } from "@/lib/world-store";
import { reconcileConversation } from "@/lib/store";

const NAV = [
  { to: "/", label: "Console", short: "Ask", icon: MessageSquare },
  { to: "/architecture", label: "Architecture", short: "Arch", icon: GitBranch },
  { to: "/tower", label: "Tower", short: "Tower", icon: Layers },
  { to: "/desktop", label: "Desktop", short: "Desk", icon: Monitor },
  { to: "/orbita", label: "Core", short: "Core", icon: FlaskConical },
  { to: "/traces", label: "Traces", short: "Log", icon: ScrollText },
  { to: "/memory", label: "Memory", short: "Mem", icon: Database },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const visit = useWorld((s) => s.visit);

  useEffect(() => {
    reconcileConversation();
  }, []);

  useEffect(() => {
    visit(placeFromPath(pathname));
  }, [pathname, visit]);

  return (
    <div className="orbital-field min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col md:flex-row">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Brand />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
            Control
          </span>
        </header>

        <aside className="hidden w-56 shrink-0 flex-col border-r border-border md:flex">
          <div className="px-5 py-6">
            <Brand />
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Hodgeform Guided · Core via MCP
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm transition-colors duration-150",
                    active
                      ? "bg-bg-subtle text-fg"
                      : "text-muted hover:bg-bg-elevated hover:text-fg",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.6} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="px-5 py-5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            Proposal ≠ evidence
          </p>
        </aside>

        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 md:hidden">
          <div className="grid grid-cols-7">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 whitespace-nowrap text-[9px] leading-none",
                    active ? "text-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.6} />
                  {item.short}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-2xl font-medium tracking-tight text-fg">
        Hodgeform
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
        Guided
      </span>
    </div>
  );
}
