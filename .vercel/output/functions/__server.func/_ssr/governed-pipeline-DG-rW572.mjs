import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { n as GOVERNED_PIPELINE, r as SUPERINTELLIGENCE_STAGES, t as CORE_LANGUAGE_ADAPTERS } from "./pipeline-BKV44rHi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/governed-pipeline-DG-rW572.js
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	core: "Core",
	local_partial: "partial",
	local_control: "control",
	contract_only: "contract",
	blocked: "not run"
};
function statusTone(status) {
	if (status === "core") return "ok";
	if (status === "local_partial") return "live";
	if (status === "local_control") return "warn";
	if (status === "blocked") return "fail";
	return "default";
}
function GovernedPipeline({ compact = false, activeId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex flex-col",
		children: GOVERNED_PIPELINE.map((stage, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-4 flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-2 rounded-full", stage.status === "core" && "bg-ok", stage.status === "local_partial" && "bg-accent", stage.status === "local_control" && "bg-warn", stage.status === "contract_only" && "bg-subtle", stage.status === "blocked" && "bg-fail/70", activeId === stage.id && "ring-2 ring-fg/40 ring-offset-2 ring-offset-bg") }), i < GOVERNED_PIPELINE.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 w-px flex-1 bg-border" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("min-w-0 pb-5", compact && "pb-4"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: stage.role
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: statusTone(stage.status),
							children: STATUS_LABEL[stage.status]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-sm text-fg",
						children: stage.title
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-relaxed text-muted",
						children: stage.body
					})
				]
			})]
		}, stage.id))
	});
}
function SuperintelligenceStages() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "grid gap-2",
		children: SUPERINTELLIGENCE_STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "grid grid-cols-[auto_1fr] gap-3 rounded-[var(--radius-md)] border border-border px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-subtle",
				children: s.id
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-fg",
				children: s.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: s.here
			})] })]
		}, s.id))
	});
}
function CoreLanguageAdapters() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Orbita adapters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Core tools" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: "These names are Hodgeform Core operations. This preview lists the contract. It does not invent their scientific behavior, and it cannot promote a language version."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 font-mono text-[11px] text-fg",
				children: CORE_LANGUAGE_ADAPTERS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: name }, name))
			})
		]
	});
}
function TowerCta() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/tower",
		className: "inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-4 text-sm text-fg transition-colors duration-150 hover:border-border-strong hover:bg-bg-subtle",
		children: "Open fiber auditor"
	});
}
//#endregion
export { TowerCta as i, GovernedPipeline as n, SuperintelligenceStages as r, CoreLanguageAdapters as t };
