import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Power, f as Folder, h as Calculator, n as Terminal, r as Square, u as Globe } from "../_libs/lucide-react.mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { n as IDLE_SECONDS, t as DESK_W } from "./desktop-DqRBeHU8.mjs";
import { t as useDesktop } from "./desktop-store-DSEsB1fI.mjs";
import { t as Button } from "./button-CMLIoOM1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desktop-CTe4s-y6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APPS = [
	{
		id: "chromium",
		label: "Chromium",
		Icon: Globe
	},
	{
		id: "files",
		label: "Files",
		Icon: Folder
	},
	{
		id: "terminal",
		label: "Terminal",
		Icon: Terminal
	},
	{
		id: "calculator",
		label: "Calc",
		Icon: Calculator
	}
];
function DesktopView() {
	const snap = useDesktop((s) => s.snap);
	const log = useDesktop((s) => s.log);
	const start = useDesktop((s) => s.start);
	const finishBoot = useDesktop((s) => s.finishBoot);
	const stop = useDesktop((s) => s.stop);
	const command = useDesktop((s) => s.command);
	(0, import_react.useEffect)(() => {
		if (snap.status !== "booting") return;
		const t = window.setTimeout(() => finishBoot(), 1600);
		return () => window.clearTimeout(t);
	}, [snap.status, finishBoot]);
	const remaining = useIdleRemaining(snap.status === "running" ? snap.lastActive : 0);
	(0, import_react.useEffect)(() => {
		if (snap.status === "running" && remaining === 0 && snap.lastActive > 0) stop();
	}, [
		remaining,
		snap.status,
		snap.lastActive,
		stop
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-[calc(100dvh-3.5rem)] md:min-h-dvh md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "px-4 py-4 md:px-6 md:py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
							children: "Simulated · not a cloud VM"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-display text-3xl tracking-tight",
							children: "PocketDesktop"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-md text-sm text-muted",
							children: "In-app canvas only. No GCP instance, noVNC, or Tailscale. Phase 5 adapter — not Hodgeform Core."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: snap.status }), snap.status === "stopped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: start,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "size-4" }), "Start"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: stop,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), "Stop"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
							label: "Machine",
							value: "e2-standard-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
							label: "Disk",
							value: "35 GB"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
							label: "Exposure",
							value: "Tailscale only"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
							label: "Idle halt",
							value: formatRemain(remaining)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-2 md:p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XfceScreen, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
					children: "1440×900 · Xvfb :1 · noVNC :6080 · localhost VNC"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "border-t border-border px-4 py-4 md:border-l md:border-t-0 md:px-5 md:py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Narrow API"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-sm text-fg",
					children: "Logged actions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-relaxed text-muted",
					children: "Allow-list: chromium, files, terminal, calculator. Policy denies sudo, shell escapes, and anything not on that list."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: snap.status !== "running",
							onClick: () => command({ action: "screenshot" }),
							children: "Screenshot"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: snap.status !== "running",
							onClick: () => command({
								action: "launch",
								app: "terminal"
							}),
							children: "Launch tty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							disabled: snap.status !== "running",
							onClick: () => {
								command({
									action: "launch",
									app: "terminal"
								});
								command({
									action: "type",
									text: "sudo bash"
								});
							},
							children: "Try sudo"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-4 space-y-2",
					children: [log.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "No actions yet. Start the VM."
					}), log.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: row.kind
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: row.ok ? "ok" : "fail",
								children: row.ok ? "ok" : "deny"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-relaxed text-muted",
							children: row.detail
						})]
					}, row.id))]
				})
			]
		})]
	});
}
function Meta({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-sm)] border border-border px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-0.5 text-fg",
			children: value
		})]
	});
}
function StatusChip({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: status === "running" ? "ok" : status === "booting" ? "warn" : "default",
		children: status
	});
}
function formatRemain(sec) {
	const s = Math.max(0, sec);
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
function useIdleRemaining(lastActive) {
	const [now, setNow] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setNow(Date.now());
		const t = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(t);
	}, []);
	if (!lastActive || !now) return IDLE_SECONDS;
	return Math.max(0, IDLE_SECONDS - Math.floor((now - lastActive) / 1e3));
}
function XfceScreen() {
	const snap = useDesktop((s) => s.snap);
	const command = useDesktop((s) => s.command);
	const focus = useDesktop((s) => s.focus);
	const close = useDesktop((s) => s.close);
	const [clock, setClock] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const tick = () => {
			const d = /* @__PURE__ */ new Date();
			setClock(`${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`);
		};
		tick();
		const t = window.setInterval(tick, 1e3);
		return () => window.clearInterval(t);
	}, []);
	function onCanvasClick(e) {
		if (snap.status !== "running") return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width * DESK_W;
		const y = (e.clientY - rect.top) / rect.height * 900;
		command({
			action: "click",
			x,
			y
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative aspect-[1440/900] w-full overflow-hidden rounded-[var(--radius-sm)]",
		style: { background: "var(--color-bg)" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0",
			onClick: onCanvasClick,
			role: "presentation",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "xfce-wall absolute inset-0" }),
				snap.status === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-3 top-10 flex flex-col gap-3",
					children: APPS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							focus(a.id);
						},
						className: "flex w-16 flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-9 items-center justify-center rounded-[var(--radius-xs)] border border-border-strong bg-bg-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(a.Icon, {
								className: "size-3.5 text-muted",
								strokeWidth: 1.6
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-fg",
							children: a.label
						})]
					}, a.id))
				}),
				snap.status === "running" && snap.windows.filter((w) => w.open).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
					app: w.id,
					x: w.x,
					y: w.y,
					ww: w.w,
					hh: w.h,
					focused: snap.focused === w.id,
					onClose: () => close(w.id),
					onFocus: () => focus(w.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowBody, {
						app: w.id,
						term: snap.term,
						title: snap.chromiumTitle,
						calc: snap.calc ?? "0"
					})
				}, w.id)),
				snap.status === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg bg-accent/80",
					style: {
						left: `${snap.pointerX / 1440 * 100}%`,
						top: `${snap.pointerY / 900 * 100}%`
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 flex h-8 items-center gap-1 border-t border-border bg-bg-elevated/95 px-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Applications"
						}),
						APPS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("h-6 rounded-[4px] px-2 font-mono text-[10px] uppercase tracking-[0.08em]", snap.focused === a.id ? "bg-bg-subtle text-fg" : "text-muted"),
							onClick: (e) => {
								e.stopPropagation();
								focus(a.id);
							},
							children: a.label
						}, a.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto pr-2 font-mono text-[10px] tabular-nums text-muted",
							children: clock
						})
					]
				})
			]
		}), snap.status !== "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg/90 px-6 text-center",
			children: snap.status === "booting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shimmer-text font-mono text-xs",
				children: "systemd · starting XFCE…"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-[10px] text-subtle",
				children: "display :1 · vnc 5900 · web 6080"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl",
				children: "VM stopped"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm text-muted",
				children: "Start PocketDesktop to give Orbita a governed screen. Chromium autostarts. Root is not on the allow-list."
			})] })
		})]
	});
}
function WindowFrame({ app, x, y, ww, hh, focused, onClose, onFocus, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("absolute flex flex-col overflow-hidden rounded-[4px] border bg-bg-elevated shadow-[var(--shadow-soft)]", focused ? "border-fg/35 z-10" : "border-border z-[1]"),
		style: {
			left: `${x / DESK_W * 100}%`,
			top: `${y / 900 * 100}%`,
			width: `${ww / DESK_W * 100}%`,
			height: `${hh / 900 * 100}%`
		},
		onClick: (e) => {
			e.stopPropagation();
			onFocus();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-6 shrink-0 items-center border-b border-border px-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
				children: app
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-auto size-4 rounded-full border border-border text-[8px] text-muted",
				onClick: (e) => {
					e.stopPropagation();
					onClose();
				},
				"aria-label": `Close ${app}`,
				children: "×"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-hidden",
			children
		})]
	});
}
function WindowBody({ app, term, title, calc }) {
	const files = (0, import_react.useMemo)(() => [
		"README.md",
		"deploy-pocketdesktop.sh",
		"pocketdesktop-vm.sh",
		"startup-pocketdesktop.sh"
	], []);
	const command = useDesktop((s) => s.command);
	if (app === "chromium") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border px-2 py-1 font-mono text-[10px] text-subtle",
			children: "https://orbita.local/"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-lg text-fg",
					children: "Orbita"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[11px] text-muted",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-[14rem] text-center text-[10px] leading-relaxed text-subtle",
					children: "Chromium autostart. Tailscale serve only. This is a desktop target, not a root session."
				})
			]
		})]
	});
	if (app === "terminal") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("pre", {
		className: "h-full bg-bg p-2 font-mono text-[10px] leading-relaxed text-ok",
		children: [term, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pipeline-live",
			children: "█"
		})]
	});
	if (app === "files") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid grid-cols-2 gap-1 p-2",
		children: files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "rounded-[4px] border border-border px-2 py-2 font-mono text-[10px] text-muted",
			children: f
		}, f))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-bg p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-2 rounded-[4px] border border-border px-2 py-1 text-right font-mono text-sm tabular-nums",
			children: calc || "0"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-1",
			children: [
				"7",
				"8",
				"9",
				"4",
				"5",
				"6",
				"1",
				"2",
				"3",
				"0",
				".",
				"="
			].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex h-7 items-center justify-center rounded-[4px] border border-border font-mono text-xs text-muted",
				onClick: (e) => {
					e.stopPropagation();
					if (n === "=") return;
					command({
						action: "type",
						text: `${calc === "0" ? "" : calc}${n}`
					});
				},
				children: n
			}, n))
		})]
	});
}
function DesktopPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopView, {});
}
//#endregion
export { DesktopPage as component };
