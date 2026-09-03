import { i as initialDesktop, r as applyDesk } from "./desktop-DqRBeHU8.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desktop-store-DSEsB1fI.js
function pushLog(log, kind, detail, ok) {
	return [{
		id: crypto.randomUUID().slice(0, 8),
		at: Date.now(),
		kind,
		detail,
		ok
	}, ...log].slice(0, 80);
}
var useDesktop = create()(persist((set, get) => ({
	snap: initialDesktop(),
	log: [],
	hydrate: (snap) => set({ snap: {
		...initialDesktop(),
		...snap,
		calc: snap.calc ?? "0",
		windows: snap.windows?.length ? snap.windows : initialDesktop().windows
	} }),
	start: () => set((s) => ({
		snap: {
			...s.snap,
			status: "booting",
			lastActive: Date.now()
		},
		log: pushLog(s.log, "vm", "instance start · us-east4-b", true)
	})),
	finishBoot: () => set((s) => {
		return {
			snap: applyDesk({
				...s.snap,
				status: "running"
			}, {
				action: "launch",
				app: "chromium"
			}).snapshot,
			log: pushLog(pushLog(s.log, "boot", "Installation complete · XFCE + noVNC", true), "launch", "autostart chromium", true)
		};
	}),
	stop: () => set((s) => ({
		snap: {
			...initialDesktop(),
			status: "stopped"
		},
		log: pushLog(s.log, "vm", "instance stopped", true)
	})),
	command: (cmd) => {
		const { snap, log } = get();
		if (/\bsudo\b|\brm\s+-rf\b/i.test(`${cmd.action} ${cmd.text ?? ""} ${cmd.app ?? ""}`)) {
			const output = "Policy engine blocked root/shell input. PocketDesktop is a desktop target, not a root shell.";
			set({
				snap,
				log: pushLog(log, cmd.action, output, false)
			});
			return {
				ok: false,
				output
			};
		}
		const result = applyDesk(snap, cmd);
		set({
			snap: result.snapshot,
			log: pushLog(log, cmd.action, result.output.split("\n")[0] ?? cmd.action, result.ok)
		});
		return {
			ok: result.ok,
			output: result.output
		};
	},
	focus: (app) => {
		get().command({
			action: "launch",
			app
		});
	},
	close: (app) => set((s) => ({
		snap: {
			...s.snap,
			focused: s.snap.focused === app ? "" : s.snap.focused,
			windows: s.snap.windows.map((w) => w.id === app ? {
				...w,
				open: false
			} : w),
			lastActive: Date.now()
		},
		log: pushLog(s.log, "close", app, true)
	}))
}), { name: "orbita-desk-v2" }));
//#endregion
export { useDesktop as t };
