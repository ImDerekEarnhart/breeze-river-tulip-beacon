//#region node_modules/.nitro/vite/services/ssr/assets/desktop-DqRBeHU8.js
var DESK_W = 1440;
var IDLE_SECONDS = 1200;
var DEFAULT_WINDOWS = [
	{
		id: "chromium",
		open: false,
		x: 72,
		y: 44,
		w: 980,
		h: 580
	},
	{
		id: "files",
		open: false,
		x: 140,
		y: 72,
		w: 560,
		h: 420
	},
	{
		id: "terminal",
		open: false,
		x: 200,
		y: 110,
		w: 680,
		h: 360
	},
	{
		id: "calculator",
		open: false,
		x: 520,
		y: 140,
		w: 280,
		h: 340
	}
];
function initialDesktop() {
	return {
		status: "stopped",
		pointerX: 720,
		pointerY: 450,
		focused: "",
		windows: DEFAULT_WINDOWS.map((w) => ({ ...w })),
		term: "orbita@pocketdesktop:~$",
		chromiumTitle: "Orbita · Console",
		calc: "0",
		lastActive: 0
	};
}
function describeDesktop(s) {
	if (s.status !== "running") return `PocketDesktop ${s.status}. 1440×900 XFCE on e2-standard-2 / us-east4-b. Tailscale-only exposure. Idle halt 20 min.`;
	const open = s.windows.filter((w) => w.open).map((w) => w.id);
	return [
		"PocketDesktop running 1440×900 XFCE",
		`pointer ${Math.round(s.pointerX)},${Math.round(s.pointerY)}`,
		`focused ${s.focused || "(desktop)"}`,
		`open: ${open.join(", ") || "(none)"}`,
		s.focused === "terminal" ? `tty ${s.term}` : "",
		s.focused === "chromium" ? `chromium ${s.chromiumTitle}` : "",
		"exposure tailscale serve :443 → 127.0.0.1:6080 (noVNC)",
		"policy: screenshot, click, type, launch allow-listed apps. No root."
	].filter(Boolean).join("\n");
}
function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, n));
}
function normalizeApp(raw) {
	const t = (raw ?? "").toLowerCase().trim();
	if (t === "chromium" || t === "chrome" || t === "browser") return "chromium";
	if (t === "files" || t === "thunar" || t === "nautilus") return "files";
	if (t === "terminal" || t === "xfce4-terminal" || t === "tty") return "terminal";
	if (t === "calculator" || t === "calc") return "calculator";
	return null;
}
function looksHostile(text) {
	return /\b(sudo|su\b|rm\s+-rf|chmod\s+777|passwd|mkfs|dd if=|shutdown|reboot|tailscale down|iptables)\b/i.test(text);
}
function hitWindow(s, x, y) {
	const open = s.windows.filter((w) => w.open);
	for (let i = open.length - 1; i >= 0; i--) {
		const w = open[i];
		if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return w.id;
	}
	if (y >= 864) return [
		"chromium",
		"files",
		"terminal",
		"calculator"
	][Math.floor(x / 48)] ?? null;
	return null;
}
function focusApp(s, id) {
	const windows = s.windows.map((w) => w.id === id ? {
		...w,
		open: true
	} : w);
	return {
		...s,
		windows,
		focused: id,
		lastActive: Date.now()
	};
}
function applyDesk(s, cmd) {
	const action = (cmd.action ?? "").toLowerCase();
	if (looksHostile(`${cmd.action ?? ""} ${cmd.text ?? ""} ${cmd.app ?? ""}`) && action !== "status") return {
		snapshot: s,
		ok: false,
		output: "Policy engine blocked root/shell input. PocketDesktop is a desktop target, not a root shell."
	};
	if (action === "status") return {
		snapshot: s,
		ok: true,
		output: describeDesktop(s)
	};
	if (action === "start") {
		if (s.status === "running") return {
			snapshot: s,
			ok: true,
			output: `already running\n${describeDesktop(s)}`
		};
		const next = focusApp({
			...s,
			status: "running",
			lastActive: Date.now()
		}, "chromium");
		return {
			snapshot: next,
			ok: true,
			output: `PocketDesktop started · XFCE 1440×900 · chromium autostart\n${describeDesktop(next)}`
		};
	}
	if (action === "stop") return {
		snapshot: {
			...initialDesktop(),
			status: "stopped"
		},
		ok: true,
		output: "PocketDesktop stopped."
	};
	if (s.status !== "running") return {
		snapshot: s,
		ok: false,
		output: "ToolDenied: PocketDesktop is not running. Start the VM first."
	};
	if (action === "screenshot") {
		const next = {
			...s,
			lastActive: Date.now()
		};
		return {
			snapshot: next,
			ok: true,
			output: describeDesktop(next)
		};
	}
	if (action === "launch" || action === "focus") {
		const app = normalizeApp(cmd.app ?? cmd.text);
		if (!app) return {
			snapshot: s,
			ok: false,
			output: "ToolDenied: app is not on the allow-list. Approved: chromium, files, terminal, calculator."
		};
		const next = focusApp(s, app);
		return {
			snapshot: next,
			ok: true,
			output: `launched ${app}\n${describeDesktop(next)}`
		};
	}
	if (action === "click") {
		const x = clamp(Number(cmd.x ?? s.pointerX), 0, DESK_W);
		const y = clamp(Number(cmd.y ?? s.pointerY), 0, 900);
		const hit = hitWindow({
			...s,
			pointerX: x,
			pointerY: y
		}, x, y);
		let next = {
			...s,
			pointerX: x,
			pointerY: y,
			lastActive: Date.now()
		};
		if (hit) next = focusApp(next, hit);
		return {
			snapshot: next,
			ok: true,
			output: `click ${Math.round(x)},${Math.round(y)} → ${hit ?? "desktop"}\n${describeDesktop(next)}`
		};
	}
	if (action === "type") {
		const text = (cmd.text ?? "").slice(0, 200);
		if (!text) return {
			snapshot: s,
			ok: false,
			output: "Missing text"
		};
		if (looksHostile(text)) return {
			snapshot: s,
			ok: false,
			output: "Policy engine blocked root/shell input. PocketDesktop is a desktop target, not a root shell."
		};
		if (!s.focused) return {
			snapshot: s,
			ok: false,
			output: "No focused window. Launch or click first."
		};
		let next = {
			...s,
			lastActive: Date.now()
		};
		if (s.focused === "terminal") next = {
			...next,
			term: `orbita@pocketdesktop:~$ ${text}`
		};
		else if (s.focused === "chromium") next = {
			...next,
			chromiumTitle: text.slice(0, 48)
		};
		else if (s.focused === "calculator") next = {
			...next,
			calc: text.slice(0, 24)
		};
		return {
			snapshot: next,
			ok: true,
			output: `typed into ${s.focused}\n${describeDesktop(next)}`
		};
	}
	return {
		snapshot: s,
		ok: false,
		output: "Unknown desktop action. Use status | start | stop | screenshot | click | type | launch."
	};
}
//#endregion
export { initialDesktop as i, IDLE_SECONDS as n, applyDesk as r, DESK_W as t };
