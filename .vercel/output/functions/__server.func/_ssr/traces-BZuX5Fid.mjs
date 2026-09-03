import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { t as useLab } from "./store-DhMEooU2.mjs";
import { n as ReceiptChain } from "./pipeline-strip-CJml1I9_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/traces-BZuX5Fid.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TracesView() {
	const traces = useLab((s) => s.traces);
	const runs = useLab((s) => s.runs);
	const stats = (0, import_react.useMemo)(() => {
		const student = runs.filter((r) => r.modelPath === "student").length;
		const mixed = runs.filter((r) => r.modelPath === "student→teacher").length;
		const teacher = runs.filter((r) => r.modelPath === "teacher").length;
		const max = Math.max(1, student, mixed, teacher);
		return [
			{
				name: "Student",
				n: student,
				max
			},
			{
				name: "Escalated",
				n: mixed,
				max
			},
			{
				name: "Governed",
				n: teacher,
				max
			}
		];
	}, [runs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
				children: "Training memory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl tracking-tight",
				children: "Failures become data."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm leading-relaxed text-muted",
				children: "When the verifier rejects the student, the teacher solves it — only with an explicit route reason — and Orbita can bound the evaluation. That record is how the worker improves — later as LoRA, never as a self-edit. A missing student does not become Grok."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Runs",
						value: String(runs.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Escalations",
						value: String(runs.filter((r) => r.escalated).length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Training pairs",
						value: String(traces.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-3 rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-4",
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: s.n
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2 overflow-hidden rounded-full bg-bg-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-accent",
						style: { width: `${Math.max(4, s.n / s.max * 100)}%` }
					})
				})] }, s.name))
			}),
			runs[0]?.route && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: "Latest route"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm text-fg",
						children: [
							runs[0].route.path,
							" · ",
							runs[0].route.reason,
							" · substituted=",
							String(runs[0].route.teacherSubstituted)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							"Policy ",
							runs[0].route.policyVersion,
							". Teacher is never a silent fallback."
						]
					})
				]
			}),
			runs[0]?.receipts && runs[0].receipts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-8 min-w-0 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: "Latest run receipts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Guided interchange hashes. Not Hodgeform Core. Schema guided-receipt/1."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptChain, { receipts: runs[0].receipts })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-8 space-y-3 pb-10",
				children: [traces.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "No teacher corrections yet. Trigger an escalation from Console."
				}), traces.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "fail",
								children: "student miss"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] text-subtle",
								children: t.id
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-fg",
							children: t.prompt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.14em] text-student",
								children: "Student"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: t.studentAttempt
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.14em] text-teacher",
								children: "Teacher"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: t.teacherAnswer
							})] })]
						})
					]
				}, t.id))]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-md)] border border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-display text-3xl tabular-nums",
			children: value
		})]
	});
}
function TracesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TracesView, {});
}
//#endregion
export { TracesPage as component };
