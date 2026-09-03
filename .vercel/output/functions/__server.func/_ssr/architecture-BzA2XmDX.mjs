import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ROLE_AXIOMS, i as NODE_COPY, r as FALSIFIERS, t as ARCHITECTURE_LOOP } from "./roles-CnJYu5Ec.mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
import { t as ArchitectureMap } from "./architecture-map-DohnfaNV.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { i as TowerCta, n as GovernedPipeline, r as SuperintelligenceStages, t as CoreLanguageAdapters } from "./governed-pipeline-DG-rW572.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/architecture-BzA2XmDX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FAST_FLOW = [
	{
		id: "api",
		hint: "request in"
	},
	{
		id: "orchestrator",
		hint: "route + state"
	},
	{
		id: "retrieval",
		hint: "context, not L_t"
	},
	{
		id: "student",
		hint: "via vLLM"
	},
	{
		id: "sandbox",
		hint: "policy then run"
	},
	{
		id: "verify",
		hint: "pass → answer"
	}
];
var GOVERN_FLOW = [
	{
		id: "teacher",
		hint: "explicit reason only"
	},
	{
		id: "tower",
		hint: "expressive boundary"
	},
	{
		id: "orbita",
		hint: "freeze → falsify"
	}
];
function SystemPlane({ selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-10 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline gap-x-3 gap-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Fast path"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: "HodgeForm stays off this loop"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
					children: FAST_FLOW.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowCard, {
						index: i + 1,
						id: n.id,
						hint: n.hint,
						selected: selected === n.id,
						onSelect
					}, n.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs leading-relaxed text-muted",
					children: "Fail or low confidence leaves this plane on an explicit teacher route. A missing student fail-closes. vLLM only serves the worker."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline gap-x-3 gap-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Governance plane"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: "change / evaluation boundary"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 grid gap-2 sm:grid-cols-3",
					children: GOVERN_FLOW.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowCard, {
						index: i + 1,
						id: n.id,
						hint: n.hint,
						selected: selected === n.id,
						onSelect
					}, n.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs leading-relaxed text-muted",
					children: "Teacher / student failure / Tower limitation → freeze → test → falsify → receipt → inactive candidate → human or deployment boundary. Nothing here auto-promotes."
				})
			] }),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: selected
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-fg",
					children: NODE_COPY[selected]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-tight",
				children: "Role axioms"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: ROLE_AXIOMS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 font-mono text-xs text-fg",
					children: a
				}, a))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "Frozen falsifiers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: "Core would not pick a diagram from prose. These tests were frozen first. Local status is Guided only — not a Core verdict, and not execution of that loop."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3",
					children: FALSIFIERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
									children: f.id.replaceAll("_", " ")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: f.localStatus === "survives" ? "ok" : f.localStatus === "blocked" ? "warn" : "fail",
									children: f.localStatus
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-fg",
								children: f.claim
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-muted",
								children: f.note
							})
						]
					}, f.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: [
					ARCHITECTURE_LOOP.caseId,
					" · ",
					ARCHITECTURE_LOOP.loopId,
					" · ",
					ARCHITECTURE_LOOP.state,
					" ·",
					" ",
					ARCHITECTURE_LOOP.channel,
					" · not app MCP"
				]
			})
		]
	});
}
function FlowCard({ index, id, hint, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onSelect(id),
		className: cn("flex min-h-11 w-full items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors duration-150", selected ? "border-fg/40 bg-bg-subtle" : "border-border bg-bg-elevated hover:border-border-strong"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[10px] text-subtle",
			children: String(index).padStart(2, "0")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm text-fg",
			children: labelOf(id)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block text-xs text-muted",
			children: hint
		})] })]
	}) });
}
function labelOf(id) {
	switch (id) {
		case "api": return "User / API";
		case "orchestrator": return "Controller";
		case "retrieval": return "Retrieval";
		case "student": return "Student";
		case "sandbox": return "Tool policy / sandbox";
		case "verify": return "Verifier";
		case "teacher": return "Teacher";
		case "tower": return "Language Tower L_t";
		case "orbita": return "Orbita / HodgeForm";
		default: return id;
	}
}
var TABS = [
	{
		id: "system",
		label: "System"
	},
	{
		id: "layers",
		label: "Layers"
	},
	{
		id: "pipeline",
		label: "Pipeline"
	},
	{
		id: "stages",
		label: "Stages"
	}
];
var PHASES = [
	{
		n: "01",
		title: "Worker loop",
		body: "Controller, local student via vLLM, tools, verifier. One agent that can finish a structured task."
	},
	{
		n: "02",
		title: "Retrieval",
		body: "Context for the student. Here: lexical BM25 + rerank. Not embeddings yet, and not the Language Tower."
	},
	{
		n: "03",
		title: "Language tower",
		body: "Current executable L_t. Detect coarse holes and nuisance splits. The Tower may propose a version. It may not promote it."
	},
	{
		n: "04",
		title: "Teacher routing",
		body: "Student first. Teacher only with an explicit reason. Missing student fail-closes. Collect traces."
	},
	{
		n: "05",
		title: "Orbita",
		body: "Teacher proposes. Plan is hashed. Approval boundary. Discovery. Independent evaluation. Promotion stays with Core."
	},
	{
		n: "06",
		title: "Improve the worker",
		body: "Failures → teacher → falsification → training set → LoRA. The worker never rewrites itself."
	},
	{
		n: "07",
		title: "PocketDesktop",
		body: "A private XFCE target with a narrow API. Screenshots, pointer, keys, allow-listed apps. Never sudo."
	}
];
function ArchitectureView() {
	const [selected, setSelected] = (0, import_react.useState)("orchestrator");
	const [tab, setTab] = (0, import_react.useState)("system");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 md:px-8 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
						children: "System"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl tracking-tight md:text-4xl",
						children: "Retrieval is not the Tower."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base",
						children: "Student is the GPU worker. vLLM only serves it. Teacher is explicit escalation, never a silent fallback. Orbita governs change. Click a box."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex gap-2 overflow-x-auto pb-1",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("h-11 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150", tab === t.id ? "border-fg/30 bg-bg-subtle text-fg" : "border-border text-muted hover:border-border-strong hover:text-fg"),
					children: t.label
				}, t.id))
			}),
			tab === "system" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemPlane, {
				selected,
				onSelect: setSelected
			}),
			tab === "layers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayersPanel, {
				selected,
				onSelect: setSelected
			}),
			tab === "pipeline" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelinePanel, {}),
			tab === "stages" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StagesPanel, {})
		]
	});
}
function LayersPanel({ selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Fast path"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchitectureMap, {
				selected,
				onSelect,
				plane: "fast"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Governance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchitectureMap, {
				selected,
				onSelect,
				plane: "govern"
			})] })]
		}),
		selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 max-w-2xl rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-5 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: selected
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-fg",
					children: NODE_COPY[selected]
				}),
				selected === "tower" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerCta, {})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-tight",
				children: "Two loops"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "student",
							children: "Fast"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: "Milliseconds to seconds"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "User → retrieve → student (via vLLM) → tool → verify → answer. HodgeForm is not on this path. Tools never share a process with the model."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "teacher",
							children: "Governed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: "When the claim matters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "Case → teacher plan → SHA-256 freeze → approval → discovery → sandbox → independent evaluation. A proposal is not a result. Inactive until a human or deployment boundary says otherwise."
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12 pb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-tight",
				children: "Build order"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 grid gap-3",
				children: PHASES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[auto_1fr] gap-4 rounded-[var(--radius-md)] border border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-subtle",
						children: p.n
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-fg",
						children: p.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: p.body
					})] })]
				}, p.n))
			})]
		})
	] });
}
function PipelinePanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8 grid gap-10 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-tight",
				children: "Representation audit and repair"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
				children: "The Language Tower is current executable L_t. Unaskable Questions is its metacognitive loop. ORB-L is provenance. Orbita decides which frozen evidence changes the durable knowledge state. Retrieval does not live in this column."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GovernedPipeline, {})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "Failure types"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: "Too coarse / too fine"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "A coarse hole: π merges states that the target must distinguish. A nuisance split: π separates states the target treats as the same. Learn what to notice, and what to ignore."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "Diagnosis"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: "SEARCH_FAILURE vs LANGUAGE_LIMIT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "Finite search that found no discriminator is SEARCH_FAILURE. A language limit is a machine-checkable argument that the entire declared grammar is blind. This preview issues neither from BM25 retrieval."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoreLanguageAdapters, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerCta, {})
			]
		})]
	});
}
function StagesPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-tight",
				children: "What counts as progress"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
				children: "Do not use the word superintelligence because a score is high. Use milestones. Stage I is explicitly refused."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 max-w-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuperintelligenceStages, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 max-w-xl text-sm leading-relaxed text-muted",
				children: "The compounding test is later: verified prior repairs should improve future discovery without an explosion in unsupported claims. That experiment is not run here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerCta, {})
			})
		]
	});
}
function ArchitecturePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchitectureView, {});
}
//#endregion
export { ArchitecturePage as component };
