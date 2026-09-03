import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as hashPreview } from "./router-DYYKjlJ5.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { t as CORE_LANGUAGE_ADAPTERS } from "./pipeline-BKV44rHi.mjs";
import { t as Button } from "./button-CMLIoOM1.mjs";
import { t as useLab } from "./store-DhMEooU2.mjs";
import { t as CORE_PROOF } from "./core-proof-C1GwXE91.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orbita-B9XzD5p9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrbitaView() {
	const experiments = useLab((s) => s.experiments);
	const [openId, setOpenId] = (0, import_react.useState)(experiments[0]?.caseId ?? null);
	const open = experiments.find((e) => e.caseId === openId) ?? experiments[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-[calc(100dvh-3.5rem)] md:min-h-dvh md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "border-b border-border px-4 py-6 md:border-b-0 md:border-r md:px-6 md:py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "HodgeForm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl tracking-tight",
					children: "Frozen before tested."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-md text-sm leading-relaxed text-muted",
					children: "Hodgeform Core owns freeze, approval, and receipts. This page is a Guided view. Governed runs fail closed until the orchestrator has tenant MCP OAuth — this UI does not invent a second scientific engine."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
								children: "Operator-chat proof"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								tone: "ok",
								children: ["Core ", CORE_PROOF.version]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-muted",
							children: "These hashes came from Hodgeform Core on the operator chat channel. They were not produced by this app's MCP client, which still lacks server OAuth."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 space-y-2 font-mono text-[11px] text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "synthetic case"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: CORE_PROOF.syntheticCase.id })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "synthetic loop"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [CORE_PROOF.syntheticLoop.id, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" · ", CORE_PROOF.syntheticLoop.valid ? "valid" : "invalid"]
								})] })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "event hash"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "break-all",
									children: CORE_PROOF.syntheticLoop.eventHash
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "protocol freeze"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [CORE_PROOF.protocolLoop.id, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" · ", CORE_PROOF.protocolLoop.valid ? "valid" : "invalid"]
								})] })] })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-8 space-y-3 font-mono text-xs text-muted",
					children: [
						"orbita_create_case",
						"orbita_create_general_problem_loop",
						"orbita_verify_general_problem_loop",
						"SHA-256 freeze",
						"exact-hash approval (not this UI)",
						"equal-budget comparison blocked until GPU + OAuth",
						"independent evaluation"
					].map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: ["0", i + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: row
						})]
					}, row))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
								children: "ORB-L admission"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Core tools" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-muted",
							children: "Origin is not evidence. EARNED requires the full gate set. Guided lists these adapter names; it does not run them, and the Tower cannot promote itself."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 font-mono text-[11px] text-fg",
							children: CORE_LANGUAGE_ADAPTERS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: name }, name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tower",
							className: "mt-4 inline-flex h-11 items-center text-sm text-fg underline-offset-4 hover:underline",
							children: "Open fiber auditor"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-sm text-muted",
					children: "Open Console, switch to Governed, and ask for an experiment. The teacher proposes; Core freezes. Comparison of Grok vs vLLM vs Hodgeform stays blocked until the student GPU and a tenant-bound server credential exist."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "px-4 py-6 md:px-6 md:py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm text-fg",
						children: "Cases"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[10px] text-subtle",
						children: [experiments.length, " local records"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2",
					children: experiments.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenId(e.caseId),
						className: "w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-left hover:border-border-strong",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] text-subtle",
								children: e.caseId
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								status: e.status,
								pass: e.evaluation?.pass
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-sm text-fg",
							children: e.question
						})]
					}) }, e.caseId))
				}),
				open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "mt-6 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] text-muted",
								children: open.caseId
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-[11px] text-subtle",
								children: ["sha256 ", hashPreview(open.planHash)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: open.question
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted",
							children: open.plan
						}),
						open.discovery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
								children: "Discovery"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-fg",
								children: open.discovery
							})]
						}),
						open.evaluation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: open.evaluation.notes
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								status: "evaluated",
								pass: open.evaluation.pass
							})]
						}),
						open.status === "frozen" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							size: "sm",
							onClick: () => useLab.getState().approveExperiment(open.caseId),
							children: "Approve plan"
						})
					]
				})
			]
		})]
	});
}
function StatusBadge({ status, pass }) {
	if (status === "evaluated") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: pass ? "ok" : "fail",
		children: pass ? "pass" : "fail"
	});
	if (status === "frozen") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "warn",
		children: "frozen"
	});
	if (status === "approved") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "live",
		children: "approved"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: status });
}
function OrbitaPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitaView, {});
}
//#endregion
export { OrbitaPage as component };
