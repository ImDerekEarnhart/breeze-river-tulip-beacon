import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as LoaderCircle, g as ArrowUp } from "../_libs/lucide-react.mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
import { t as ArchitectureMap } from "./architecture-map-DohnfaNV.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { t as useDesktop } from "./desktop-store-DSEsB1fI.mjs";
import { t as Button } from "./button-CMLIoOM1.mjs";
import { t as useLab } from "./store-DhMEooU2.mjs";
import { t as CORE_PROOF } from "./core-proof-C1GwXE91.mjs";
import { i as runSyntheticHodgeformCase, n as runAgent, t as getInfrastructure } from "./api-BB7jrMNz.mjs";
import { r as RunMeta, t as PipelineStrip } from "./pipeline-strip-CJml1I9_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BoSeq-3g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InfraPanel() {
	const [infra, setInfra] = (0, import_react.useState)(null);
	const [proofBusy, setProofBusy] = (0, import_react.useState)(false);
	const [proof, setProof] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		getInfrastructure().then((row) => {
			if (!cancelled) setInfra(row);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	async function runProof() {
		if (proofBusy) return;
		setProofBusy(true);
		try {
			const row = await runSyntheticHodgeformCase();
			setProof(row);
		} catch (e) {
			setProof({
				ok: false,
				error: e instanceof Error ? e.message : "Proof failed",
				steps: [],
				ids: {}
			});
		} finally {
			setProofBusy(false);
		}
	}
	if (!infra) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: "Checking live providers…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptCard, {})]
	});
	const mcpTone = infra.mcp?.connected ? "ok" : infra.mcp?.status === "auth_required" ? "warn" : "fail";
	const studentOk = Boolean(infra.providers?.student.configured && infra.studentHealth?.ok);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Runtime (honest)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-2 text-xs leading-relaxed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "Student GPU"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: studentOk ? "student" : "fail",
									children: studentOk ? "healthy" : infra.providers?.student.configured ? "down" : "unset"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-fg",
								children: infra.student
							}),
							infra.studentHealth?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted",
								children: infra.studentHealth.error
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "Teacher / Grok"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: infra.providers?.teacher.configured ? "teacher" : "fail",
								children: infra.providers?.teacher.configured ? "configured" : "missing"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-fg",
							children: infra.teacher
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "App MCP"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: mcpTone,
									children: infra.mcp?.status ?? "unknown"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-fg",
								children: [
									infra.mcp?.host,
									" · ",
									infra.mcp?.authMode ?? infra.mcp?.auth
								]
							}),
							infra.mcp?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted",
								children: infra.mcp.error
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "Core UI liveness"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: infra.uiHealth?.ok ? "ok" : "fail",
								children: infra.uiHealth?.ok ? "up" : "down"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-fg",
							children: [
								infra.uiHealth?.service ?? "ui",
								" ",
								infra.uiHealth?.version ?? "",
								" · not MCP auth"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "Desktop"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "warn",
								children: "simulated"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-fg",
							children: infra.desktop
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "App MCP proof"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted",
						children: "tools/list → synthetic case → freeze/verify. Fails closed without server OAuth."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						className: "mt-2 h-11 w-full",
						disabled: proofBusy,
						onClick: () => void runProof(),
						children: proofBusy ? "Probing Core…" : "Run non-prod proof"
					}),
					proof && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-2 text-xs ${proof.ok ? "text-fg" : "text-muted"}`,
						children: proof.ok ? `Core accepted · ${proof.ids.case_id ?? "case"} ${proof.ids.loop_id ?? ""}` : proof.error ?? "Proof failed closed"
					})
				]
			}),
			infra.benchmark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "Equal-budget comparison"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: infra.benchmark.ready ? "ok" : "warn",
							children: infra.benchmark.executed ? "ran" : "blocked"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							infra.benchmark.equalBudget.maxOutputTokens,
							" tokens ·",
							" ",
							infra.benchmark.equalBudget.timeoutSeconds,
							"s · ",
							infra.benchmark.equalBudget.nTasks,
							" ",
							"tasks. Not an official ARC score."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1",
						children: infra.benchmark.conditions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-fg",
								children: labelFor(c.id)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: c.ready ? "ok" : "fail",
								children: c.ready ? "ready" : "blocked"
							})]
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Comparison waits until GPU student health and tenant server OAuth exist. Grok is not the student."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: infra.retrieval
			})
		]
	});
}
function ReceiptCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Core receipts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted",
				children: [
					"Operator chat channel, not this app's MCP client. ",
					CORE_PROOF.product,
					" ",
					CORE_PROOF.version,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[10px] leading-relaxed text-fg",
				children: [
					"case ",
					CORE_PROOF.syntheticCase.id,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"loop ",
					CORE_PROOF.syntheticLoop.id,
					" · ",
					CORE_PROOF.syntheticLoop.valid ? "valid" : "unverified",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"protocol ",
					CORE_PROOF.protocolLoop.id,
					" · ",
					CORE_PROOF.protocolLoop.valid ? "valid" : "unverified"
				]
			})
		]
	});
}
function labelFor(id) {
	if (id === "grok_alone") return "Grok alone";
	if (id === "vllm_student") return "vLLM student";
	if (id === "grok_vllm_hodgeform") return "Grok/vLLM + Hodgeform";
	return id;
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		className: cn("min-h-[44px] w-full resize-none rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2.5 text-sm text-fg placeholder:text-subtle outline-none transition-colors duration-150 focus:border-border-strong focus:ring-2 focus:ring-accent/30", className),
		...props,
		suppressHydrationWarning: true
	});
});
Textarea.displayName = "Textarea";
var SAMPLES = [
	{
		label: "Routing",
		text: "Is retrieval the Language Tower? If the student GPU is missing, does Guided silently call the teacher?"
	},
	{
		label: "Architecture",
		text: "Why shouldn't the agent live inside vLLM, and when does the student escalate to the teacher?"
	},
	{
		label: "Tower",
		text: "What is the Language Tower in the manifesto pipeline, and how does a fiber collision differ from a LANGUAGE_LIMIT?"
	},
	{
		label: "Sandbox",
		text: "Use the sandbox to compute the future value of $10,000 compounded at 7% annually for 12 years."
	},
	{
		label: "Memory",
		text: "What are the six memory kinds Orbita keeps outside the prompt window?"
	},
	{
		label: "ORB-1",
		text: "Admit coordinate derivation D on Q(i)[Z^d], then say why the π/4 shift is quarantined. This is not a Core LANGUAGE_LIMIT."
	},
	{
		label: "FLM",
		text: "Run the Fiber Lattice Machine refine demo. Say why a candidate cannot self-admit, and that this is not Hodgeform Core."
	},
	{
		label: "Desktop",
		text: "Take a PocketDesktop screenshot and say which apps are allow-listed. Do not use sudo."
	},
	{
		label: "Governed",
		text: "Propose a governed experiment: does requiring JSON schema on the worker reduce tool parse failures?"
	}
];
function ConsoleView() {
	const mode = useLab((s) => s.mode);
	const setMode = useLab((s) => s.setMode);
	const turns = useLab((s) => s.turns);
	const runs = useLab((s) => s.runs);
	const activeRunId = useLab((s) => s.activeRunId);
	const replayIndex = useLab((s) => s.replayIndex);
	const setReplayIndex = useLab((s) => s.setReplayIndex);
	const addUserTurn = useLab((s) => s.addUserTurn);
	const completeRun = useLab((s) => s.completeRun);
	const failUserTurn = useLab((s) => s.failUserTurn);
	const clearSession = useLab((s) => s.clearSession);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const scroller = (0, import_react.useRef)(null);
	const active = runs.find((r) => r.id === activeRunId) ?? runs[0];
	const visibleSteps = active ? replayIndex : 0;
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({
			top: scroller.current.scrollHeight,
			behavior: "smooth"
		});
	}, [turns.length, busy]);
	(0, import_react.useEffect)(() => {
		if (!active || busy) return;
		setReplayIndex(1);
		if (active.steps.length <= 1) return;
		let i = 1;
		const id = window.setInterval(() => {
			i += 1;
			setReplayIndex(i);
			if (i >= active.steps.length) window.clearInterval(id);
		}, 260);
		return () => window.clearInterval(id);
	}, [
		active?.id,
		busy,
		setReplayIndex
	]);
	const liveKind = (0, import_react.useMemo)(() => {
		if (!active) return void 0;
		const idx = Math.max(0, Math.min(visibleSteps, active.steps.length) - 1);
		return active.steps[idx]?.kind;
	}, [active, visibleSteps]);
	const liveModel = (0, import_react.useMemo)(() => {
		if (!active) return void 0;
		const idx = Math.max(0, Math.min(visibleSteps, active.steps.length) - 1);
		return active.steps[idx]?.model;
	}, [active, visibleSteps]);
	const liveTool = (0, import_react.useMemo)(() => {
		if (!active) return void 0;
		const idx = Math.max(0, Math.min(visibleSteps, active.steps.length) - 1);
		return active.steps[idx]?.data?.name;
	}, [active, visibleSteps]);
	async function submit(text, nextMode = mode) {
		const request = text.trim();
		if (!request || busy) return;
		setDraft("");
		setBusy(true);
		const history = useLab.getState().turns.slice(-6).map((t) => ({
			role: t.role,
			content: t.content
		}));
		const turnId = addUserTurn(request);
		try {
			const run = await runAgent({ data: {
				request,
				mode: nextMode,
				history,
				desktop: useDesktop.getState().snap
			} });
			completeRun(turnId, run);
		} catch (e) {
			failUserTurn(turnId, e instanceof Error ? e.message : "Agent failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid md:min-h-dvh md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex h-[calc(100dvh-7.25rem)] min-h-0 flex-col border-b border-border md:h-dvh md:border-b-0 md:border-r",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl tracking-tight md:text-2xl",
						children: "Guided"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Ask · analyze · govern — Core via MCP"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeSwitch, {
							mode,
							onChange: setMode,
							disabled: busy
						}), turns.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: clearSession,
							children: "Clear"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scroller,
					className: "flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6",
					children: [
						turns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { onPick: (s) => {
							if (s.label === "Governed") setMode("governed");
							submit(s.text, s.label === "Governed" ? "governed" : mode);
						} }),
						turns.map((t) => {
							const run = t.runId ? runs.find((r) => r.id === t.runId) : void 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
								className: "rise-in",
								children: t.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "ml-auto max-w-[46rem] rounded-[var(--radius-lg)] bg-bg-subtle px-4 py-3 text-sm leading-relaxed",
									children: t.content
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "max-w-[46rem] rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mb-2 flex flex-wrap items-center gap-2",
											children: run && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: run.escalated ? "teacher" : "student",
													children: run.modelPath
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: run.status === "ok" ? "ok" : "fail",
													children: run.status
												}),
												run.orbita && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "live",
													children: "governed"
												})
											] })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "whitespace-pre-wrap text-sm leading-relaxed text-fg",
											children: t.content
										}),
										run && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RunMeta, { run }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
												className: "md:hidden",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
													className: "cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
													children: [
														"Pipeline · ",
														run.steps.length,
														" steps"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-2",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStrip, {
														steps: run.steps,
														visible: run.steps.length
													})
												})]
											})]
										})
									]
								})
							}, t.id);
						}),
						busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shimmer-text",
								children: mode === "governed" ? "Freezing a plan…" : "Worker is running…"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "border-t border-border p-3 md:p-4",
					onSubmit: (e) => {
						e.preventDefault();
						submit(draft);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: draft,
							onChange: (e) => setDraft(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit(draft);
								}
							},
							placeholder: mode === "governed" ? "Ask for a claim you actually want tested…" : "Ask the worker. Escalate only if it must.",
							rows: 2,
							className: "border-0 bg-transparent focus:ring-0",
							disabled: busy
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							disabled: busy || !draft.trim(),
							"aria-label": "Send",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: mode === "governed" ? "Governed · Hodgeform Core freeze/approve (fail-closed without MCP)" : "Fast loop · worker first · teacher only with a reason · never a silent fallback"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden min-h-0 flex-col bg-bg md:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3 md:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Live layers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-sm text-fg",
					children: "Architecture while it thinks"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 overflow-y-auto px-4 py-4 md:px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfraPanel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Fast path"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchitectureMap, {
						compact: true,
						plane: "fast",
						activeKind: liveKind,
						activeModel: liveModel,
						activeTool: liveTool
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Governance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchitectureMap, {
						compact: true,
						plane: "govern",
						activeKind: liveKind,
						activeModel: liveModel,
						activeTool: liveTool
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Pipeline"
					}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStrip, {
						steps: active.steps,
						visible: Math.max(visibleSteps, busy ? 2 : 0),
						running: busy
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Send a request to watch retrieve, route, tools, and verify light up."
					})] }),
					active && active.retrieved.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Tower hits"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: active.retrieved.slice(0, 4).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-[var(--radius-sm)] border border-border px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-fg",
									children: d.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] text-subtle",
									children: d.score.toFixed(2)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] text-muted",
								children: d.id
							})]
						}, d.id))
					})] })
				]
			})]
		})]
	});
}
function ModeSwitch({ mode, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex rounded-[var(--radius-sm)] border border-border p-0.5",
		children: ["fast", "governed"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled,
			onClick: () => onChange(m),
			className: cn("h-8 rounded-[6px] px-3 font-mono text-[10px] uppercase tracking-[0.12em]", mode === m ? "bg-bg-subtle text-fg" : "text-muted"),
			children: m
		}, m))
	});
}
function EmptyState({ onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg py-6 md:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl tracking-tight text-fg md:text-4xl",
				children: "Hodgeform Guided"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-sm leading-relaxed text-muted",
				children: "Models propose. Hodgeform Core freezes, executes, and bounds claims. Worker and teacher are roles on a replaceable OpenAI-compatible provider — not proof of a local vLLM or a desktop VM."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-2",
				children: SAMPLES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onPick(s),
					className: "rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-left transition-colors duration-150 hover:border-border-strong",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-sm text-fg",
						children: s.text
					})]
				}, s.label))
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsoleView, {});
}
//#endregion
export { Home as component };
