import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, r as formatDate } from "./router-DYYKjlJ5.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { t as CORPUS } from "./corpus-CUgoZ7aV.mjs";
import { t as useLab } from "./store-DhMEooU2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/memory-qdHkf97S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "working",
		label: "Working"
	},
	{
		id: "semantic",
		label: "Semantic"
	},
	{
		id: "episodic",
		label: "Episodic"
	},
	{
		id: "procedural",
		label: "Procedural"
	},
	{
		id: "experimental",
		label: "Experimental"
	},
	{
		id: "training",
		label: "Training"
	}
];
function MemoryView() {
	const memories = useLab((s) => s.memories);
	const turns = useLab((s) => s.turns);
	const [kind, setKind] = (0, import_react.useState)("all");
	const working = (0, import_react.useMemo)(() => turns.slice(-4).map((t) => ({
		id: t.id,
		kind: "working",
		title: t.role === "user" ? "User" : "Agent",
		body: t.content.slice(0, 240),
		createdAt: 0
	})), [turns]);
	const semantic = CORPUS.map((d) => ({
		id: d.id,
		kind: "semantic",
		title: d.title,
		body: d.text.slice(0, 220),
		createdAt: 0
	}));
	const all = [
		...working,
		...memories,
		...semantic
	];
	const filtered = kind === "all" ? all : all.filter((m) => m.kind === kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
				children: "State"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl tracking-tight",
				children: "Memory is not the prompt."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm leading-relaxed text-muted",
				children: "Working, semantic, episodic, procedural, experimental, training. Each lives in its own store so the generator is not asked to remember the lab."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex gap-2 overflow-x-auto pb-1",
				children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setKind(k.id),
					className: cn("h-9 shrink-0 rounded-full border px-3 font-mono text-[10px] uppercase tracking-[0.12em]", kind === k.id ? "border-fg/30 bg-bg-subtle text-fg" : "border-border text-muted"),
					children: k.label
				}, k.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 grid gap-3 pb-10 md:grid-cols-2",
				children: filtered.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[var(--radius-md)] border border-border bg-bg-elevated p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: m.kind }), m.createdAt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] text-subtle",
								children: formatDate(m.createdAt)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 text-sm text-fg",
							children: m.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: m.body
						})
					]
				}, `${m.kind}-${m.id}`))
			})
		]
	});
}
function MemoryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryView, {});
}
//#endregion
export { MemoryPage as component };
