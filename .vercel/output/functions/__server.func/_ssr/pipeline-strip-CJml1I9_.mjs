import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pipeline-strip-CJml1I9_.js
var import_jsx_runtime = require_jsx_runtime();
function PipelineStrip({ steps, visible, running }) {
	const shown = steps.slice(0, Math.max(visible, 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
		className: "flex flex-col gap-2",
		children: [shown.map((s, i) => {
			const last = i === shown.length - 1 && running && visible < steps.length;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rise-in flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1 size-2 rounded-full", last ? "bg-accent pipeline-live" : "bg-fg/70") }), i < shown.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 w-px flex-1 bg-border" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 pb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline gap-x-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
								children: s.kind
							}), s.model && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-mono text-[10px] uppercase tracking-[0.12em]", s.model === "teacher" ? "text-teacher" : "text-student"),
								children: s.model
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-fg",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs leading-relaxed text-muted",
							children: s.detail
						})
					]
				})]
			}, s.id);
		}), running && shown.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "font-mono text-xs text-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shimmer-text",
				children: "Retrieving context…"
			})
		})]
	});
}
function RunMeta({ run }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [run.totalMs, " ms"] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: run.tokensHint }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: run.escalated ? "text-teacher" : "text-student",
					children: run.modelPath
				}),
				run.studentModel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					title: "Provider-reported student model",
					children: run.studentModel
				}),
				run.teacherModel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					title: "Provider-reported teacher model",
					children: run.teacherModel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(run.confidence * 100), "% conf"] }),
				run.route && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					title: `policy ${run.route.policyVersion}`,
					children: [
						run.route.path,
						":",
						run.route.reason,
						run.route.teacherSubstituted ? " · substituted" : ""
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptChain, { receipts: run.receipts })]
	});
}
function ReceiptChain({ receipts }) {
	if (!receipts?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-1",
		children: receipts.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "min-w-0 font-mono text-[10px] text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "uppercase tracking-[0.12em] text-subtle",
					children: r.kind
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "break-all text-fg",
					children: [r.hash.slice(0, 12), "…"]
				}),
				i > 0 && r.parentReceiptIds[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-subtle",
					children: [" ← ", r.parentReceiptIds[0].slice(0, 8)]
				}) : null
			]
		}, r.id))
	});
}
//#endregion
export { ReceiptChain as n, RunMeta as r, PipelineStrip as t };
