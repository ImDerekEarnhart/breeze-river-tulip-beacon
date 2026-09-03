import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyDesk,
  initialDesktop,
  type DeskAction,
  type DeskApp,
  type DeskLog,
  type DeskSnapshot,
} from "@/lib/desktop";
import { useWorld } from "@/lib/world-store";

type DeskState = {
  snap: DeskSnapshot;
  log: DeskLog[];
  hydrate: (snap: DeskSnapshot) => void;
  start: () => void;
  finishBoot: () => void;
  stop: () => void;
  command: (cmd: DeskAction) => { ok: boolean; output: string };
  focus: (app: DeskApp) => void;
  close: (app: DeskApp) => void;
};

function pushLog(log: DeskLog[], kind: string, detail: string, ok: boolean): DeskLog[] {
  return [
    { id: crypto.randomUUID().slice(0, 8), at: Date.now(), kind, detail, ok },
    ...log,
  ].slice(0, 80);
}

export const useDesktop = create<DeskState>()(
  persist(
    (set, get) => ({
      snap: initialDesktop(),
      log: [],
      hydrate: (snap) => {
        const next = {
          ...initialDesktop(),
          ...snap,
          calc: snap.calc ?? "0",
          windows: snap.windows?.length ? snap.windows : initialDesktop().windows,
        };
        useWorld.getState().noteDesk(next);
        set({ snap: next });
      },
      start: () =>
        set((s) => ({
          snap: { ...s.snap, status: "booting", lastActive: Date.now() },
          log: pushLog(s.log, "vm", "instance start · us-east4-b", true),
        })),
      finishBoot: () =>
        set((s) => {
          const opened = applyDesk(
            { ...s.snap, status: "running" },
            { action: "launch", app: "chromium" },
          );
          return {
            snap: opened.snapshot,
            log: pushLog(
              pushLog(s.log, "boot", "Installation complete · XFCE + noVNC", true),
              "launch",
              "autostart chromium",
              true,
            ),
          };
        }),
      stop: () =>
        set((s) => ({
          snap: { ...initialDesktop(), status: "stopped" },
          log: pushLog(s.log, "vm", "instance stopped", true),
        })),
      command: (cmd) => {
        const { snap, log } = get();
        if (/\bsudo\b|\brm\s+-rf\b/i.test(`${cmd.action} ${cmd.text ?? ""} ${cmd.app ?? ""}`)) {
          const output =
            "Policy engine blocked root/shell input. PocketDesktop is a desktop target, not a root shell.";
          set({
            snap,
            log: pushLog(log, cmd.action, output, false),
          });
          return { ok: false, output };
        }
        const result = applyDesk(snap, cmd);
        useWorld.getState().noteDesk(result.snapshot);
        set({
          snap: result.snapshot,
          log: pushLog(log, cmd.action, result.output.split("\n")[0] ?? cmd.action, result.ok),
        });
        return { ok: result.ok, output: result.output };
      },
      focus: (app) => {
        get().command({ action: "launch", app });
      },
      close: (app) =>
        set((s) => ({
          snap: {
            ...s.snap,
            focused: s.snap.focused === app ? "" : s.snap.focused,
            windows: s.snap.windows.map((w) => (w.id === app ? { ...w, open: false } : w)),
            lastActive: Date.now(),
          },
          log: pushLog(s.log, "close", app, true),
        })),
    }),
    { name: "orbita-desk-v2" },
  ),
);
