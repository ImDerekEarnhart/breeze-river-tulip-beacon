import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./router-DYYKjlJ5.mjs";
import { t as Badge } from "./badge-C19BGtg6.mjs";
import { n as GovernedPipeline, r as SuperintelligenceStages, t as CoreLanguageAdapters } from "./governed-pipeline-DG-rW572.mjs";
import { t as Button } from "./button-CMLIoOM1.mjs";
import { a as diagnoseWorld, i as diagnoseSuite, n as ORB1_OPERATORS, o as localLanguageSnapshot, r as admitOperator, s as snapshotCanonical, t as LOCAL_FIBER_WORLDS } from "./admit-Ck2WKpPY.mjs";
import { r as runFlmScenario } from "./api-BB7jrMNz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tower-BUB7K4Np.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function abs(n) {
	return n < 0n ? -n : n;
}
function gcd(a, b) {
	let x = abs(a);
	let y = abs(b);
	while (y !== 0n) {
		const t = x % y;
		x = y;
		y = t;
	}
	return x === 0n ? 1n : x;
}
function frac(n, d = 1n) {
	let nn = typeof n === "bigint" ? n : BigInt(n);
	let dd = typeof d === "bigint" ? d : BigInt(d);
	if (dd === 0n) throw new Error("Frac: division by zero");
	if (dd < 0n) {
		nn = -nn;
		dd = -dd;
	}
	const g = gcd(nn, dd);
	return {
		n: nn / g,
		d: dd / g
	};
}
function formatFrac(f) {
	if (f.d === 1n) return f.n.toString();
	return `${f.n}/${f.d}`;
}
function eqFrac(a, b) {
	return a.n === b.n && a.d === b.d;
}
function addFrac(a, b) {
	return frac(a.n * b.d + b.n * a.d, a.d * b.d);
}
function subFrac(a, b) {
	return frac(a.n * b.d - b.n * a.d, a.d * b.d);
}
function mulFrac(a, b) {
	return frac(a.n * b.n, a.d * b.d);
}
function negFrac(a) {
	return {
		n: -a.n,
		d: a.d
	};
}
function absFracN(f) {
	return abs(f.n);
}
function absFracD(f) {
	return abs(f.d);
}
function gq(a = 0, b = 0) {
	return {
		a: typeof a === "object" ? a : frac(a),
		b: typeof b === "object" ? b : frac(b)
	};
}
function formatGQ(z) {
	return [formatFrac(z.a), formatFrac(z.b)];
}
var GQ_ZERO = gq(0, 0);
var GQ_ONE = gq(1, 0);
gq(0, 1);
function isZeroGQ(z) {
	return z.a.n === 0n && z.b.n === 0n;
}
function eqGQ(x, y) {
	return eqFrac(x.a, y.a) && eqFrac(x.b, y.b);
}
function addGQ(x, y) {
	return {
		a: addFrac(x.a, y.a),
		b: addFrac(x.b, y.b)
	};
}
function negGQ(x) {
	return {
		a: negFrac(x.a),
		b: negFrac(x.b)
	};
}
function mulGQ(x, y) {
	return {
		a: subFrac(mulFrac(x.a, y.a), mulFrac(x.b, y.b)),
		b: addFrac(mulFrac(x.a, y.b), mulFrac(x.b, y.a))
	};
}
function conjGQ(x) {
	return {
		a: x.a,
		b: negFrac(x.b)
	};
}
function normGQ(x) {
	return addFrac(mulFrac(x.a, x.a), mulFrac(x.b, x.b));
}
/** u on the Q(i) unit circle iff a² + b² = 1 exactly. */
function isQiUnitCircle(x) {
	return eqFrac(normGQ(x), frac(1n));
}
/** Signed 16-bit paging overflow. Labeled simulation — not an ISA, not a Tower VM. */
var PAGE_LIMIT = 2n ** 15n;
var PAGE_LABEL = "simulated-16-bit-overflow";
function pageFrac(f) {
	const nAbs = absFracN(f);
	const dAbs = absFracD(f);
	return {
		status: nAbs >= PAGE_LIMIT || dAbs >= PAGE_LIMIT ? "OVERFLOW" : "OK",
		simulated: true,
		notARegisterMachine: true,
		notTheTowerVm: true,
		label: PAGE_LABEL,
		nAbs: nAbs.toString(),
		dAbs: dAbs.toString(),
		limit: PAGE_LIMIT.toString()
	};
}
function keyOf(k) {
	return k.join(",");
}
function parseKey(s) {
	if (s === "") return [];
	return s.split(",").map((x) => Number(x));
}
function cmpKey(a, b) {
	const n = Math.max(a.length, b.length);
	for (let i = 0; i < n; i += 1) {
		const da = a[i] ?? 0;
		const db = b[i] ?? 0;
		if (da !== db) return da - db;
	}
	return 0;
}
function emptyState(d) {
	return {
		d,
		c: /* @__PURE__ */ new Map()
	};
}
function oneState(d) {
	const s = emptyState(d);
	s.c.set(keyOf(Array.from({ length: d }, () => 0)), GQ_ONE);
	return s;
}
function fromTerms(d, terms) {
	const s = emptyState(d);
	for (const [k, v] of terms) {
		if (k.length !== d) throw new Error("State: bad key dimension");
		addTerm(s, k, v);
	}
	return s;
}
function addTerm(s, k, v) {
	if (isZeroGQ(v)) return;
	const id = keyOf(k);
	const prev = s.c.get(id);
	const next = prev ? addGQ(prev, v) : v;
	if (isZeroGQ(next)) s.c.delete(id);
	else s.c.set(id, next);
}
function cloneState(a) {
	return fromTerms(a.d, Array.from(a.c.entries(), ([k, v]) => [parseKey(k), v]));
}
function addState(a, b) {
	if (a.d !== b.d) throw new Error("State: dimension mismatch");
	const z = cloneState(a);
	for (const [k, v] of b.c) addTerm(z, parseKey(k), v);
	return z;
}
function negState(a) {
	return fromTerms(a.d, Array.from(a.c.entries(), ([k, v]) => [parseKey(k), negGQ(v)]));
}
function subState(a, b) {
	return addState(a, negState(b));
}
function mulState(a, b) {
	if (a.d !== b.d) throw new Error("State: dimension mismatch");
	const z = emptyState(a.d);
	for (const [ks, av] of a.c) {
		const k = parseKey(ks);
		for (const [js, bv] of b.c) {
			const j = parseKey(js);
			addTerm(z, k.map((x, i) => x + (j[i] ?? 0)), mulGQ(av, bv));
		}
	}
	return z;
}
function starState(a) {
	return fromTerms(a.d, Array.from(a.c.entries(), ([k, v]) => [parseKey(k).map((x) => -x), conjGQ(v)]));
}
function eqState(a, b) {
	if (a.d !== b.d || a.c.size !== b.c.size) return false;
	for (const [k, v] of a.c) {
		const w = b.c.get(k);
		if (!w || !eqGQ(v, w)) return false;
	}
	return true;
}
function isRealState(a) {
	return eqState(a, starState(a));
}
function serial(a) {
	return [...a.c.keys()].sort((x, y) => cmpKey(parseKey(x), parseKey(y))).map((k) => {
		const v = a.c.get(k) ?? GQ_ZERO;
		return [parseKey(k), formatGQ(v)];
	});
}
function basisCos(n, d = 1) {
	const k = [n, ...Array.from({ length: d - 1 }, () => 0)];
	const nk = k.map((x) => -x);
	return fromTerms(d, [[k, {
		a: {
			n: 1n,
			d: 2n
		},
		b: {
			n: 0n,
			d: 1n
		}
	}], [nk, {
		a: {
			n: 1n,
			d: 2n
		},
		b: {
			n: 0n,
			d: 1n
		}
	}]]);
}
function basisSin(n, d = 1) {
	const k = [n, ...Array.from({ length: d - 1 }, () => 0)];
	const nk = k.map((x) => -x);
	return fromTerms(d, [[k, {
		a: {
			n: 0n,
			d: 1n
		},
		b: {
			n: -1n,
			d: 2n
		}
	}], [nk, {
		a: {
			n: 0n,
			d: 1n
		},
		b: {
			n: 1n,
			d: 2n
		}
	}]]);
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a += 1831565813;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function randint(r, lo, hi) {
	return lo + Math.floor(r() * (hi - lo + 1));
}
function randGQ(r) {
	return gq(frac(randint(r, -4, 4), randint(r, 1, 4)), frac(randint(r, -4, 4), randint(r, 1, 4)));
}
function randState(r, d, maxTerms = 6) {
	const terms = [];
	const n = randint(r, 0, maxTerms);
	for (let i = 0; i < n; i += 1) {
		const k = Array.from({ length: d }, () => randint(r, -3, 3));
		terms.push([k, randGQ(r)]);
	}
	return fromTerms(d, terms);
}
function randRealState(r, d, maxPairs = 4) {
	const terms = [[Array.from({ length: d }, () => 0), gq(frac(randint(r, -4, 4), randint(r, 1, 4)), 0)]];
	const n = randint(r, 0, maxPairs);
	for (let i = 0; i < n; i += 1) {
		let k = [];
		let guard = 0;
		while (guard < 16 && (k.length === 0 || k.every((x) => x === 0))) {
			k = Array.from({ length: d }, () => randint(r, -3, 3));
			guard += 1;
		}
		const a = randGQ(r);
		const nk = k.map((x) => -x);
		terms.push([k, a]);
		terms.push([nk, {
			a: a.a,
			b: {
				n: -a.b.n,
				d: a.b.d
			}
		}]);
	}
	return fromTerms(d, terms);
}
function check(cond, name, failures) {
	if (!cond) failures.push(name);
}
function mixedOrderExpected() {
	return fromTerms(1, [
		[[3], gq(0, frac(-1, 4))],
		[[-3], gq(0, frac(1, 4))],
		[[1], gq(0, frac(-1, 4))],
		[[-1], gq(0, frac(1, 4))]
	]);
}
function zeroFrequencyExpected() {
	return fromTerms(1, [
		[[0], gq(frac(1, 2), 0)],
		[[2], gq(frac(1, 4), 0)],
		[[-2], gq(frac(1, 4), 0)]
	]);
}
/**
* Exact ring laws on Q(i)[Z^d]. Randomized cases use mulberry32, not Python
* random.Random, so they will not bit-match the attachment seed stream.
* The two archived trigonometric regressions are seed-free and must match.
*/
function runStepZero(opts) {
	const seed = opts?.seed ?? 20260819;
	const N = opts?.n ?? 80;
	const d = opts?.d ?? 2;
	const r = mulberry32(seed);
	const fail = [];
	const Z = emptyState(d);
	const O = oneState(d);
	for (let i = 0; i < N; i += 1) {
		const a = randState(r, d);
		const b = randState(r, d);
		const c = randState(r, d);
		check(eqState(addState(a, b), addState(b, a)), `add_comm_${i}`, fail);
		check(eqState(addState(addState(a, b), c), addState(a, addState(b, c))), `add_assoc_${i}`, fail);
		check(eqState(addState(a, Z), a) && eqState(addState(Z, a), a), `add_zero_${i}`, fail);
		check(eqState(addState(a, negState(a)), Z), `add_inv_${i}`, fail);
		check(eqState(mulState(a, b), mulState(b, a)), `mul_comm_${i}`, fail);
		check(eqState(mulState(mulState(a, b), c), mulState(a, mulState(b, c))), `mul_assoc_${i}`, fail);
		check(eqState(mulState(a, O), a) && eqState(mulState(O, a), a), `mul_one_${i}`, fail);
		check(eqState(mulState(a, addState(b, c)), addState(mulState(a, b), mulState(a, c))), `left_dist_${i}`, fail);
		check(eqState(mulState(addState(a, b), c), addState(mulState(a, c), mulState(b, c))), `right_dist_${i}`, fail);
	}
	for (let i = 0; i < N; i += 1) {
		const a = randRealState(r, d);
		const b = randRealState(r, d);
		check(isRealState(a), `real_gen_a_${i}`, fail);
		check(isRealState(b), `real_gen_b_${i}`, fail);
		check(isRealState(addState(a, b)), `real_add_${i}`, fail);
		check(isRealState(mulState(a, b)), `real_mul_${i}`, fail);
	}
	const x = randState(r, d);
	check(eqState(subState(x, x), Z), "canonical_zero", fail);
	check(serial(subState(x, x)).length === 0, "canonical_zero_serial", fail);
	check(JSON.stringify(serial(oneState(2))) === JSON.stringify([[[0, 0], ["1", "0"]]]), "canonical_one", fail);
	const c1 = basisCos(1, 1);
	const s2 = basisSin(2, 1);
	const mixed = mulState(c1, s2);
	check(eqState(mixed, mulState(s2, c1)), "regression_mixed_order_commutativity", fail);
	check(eqState(mixed, mixedOrderExpected()), "regression_mixed_order_formula", fail);
	const prod = mulState(c1, c1);
	check(eqState(prod, zeroFrequencyExpected()), "regression_zero_frequency_preserved", fail);
	const unit = prod.c.get("0") ?? {
		a: frac(0),
		b: frac(0)
	};
	check(unit.a.n === 1n && unit.a.d === 2n && unit.b.n === 0n, "unit_frequency_coefficient_half", fail);
	return {
		schema: "orb1-step-zero-exact-check/1",
		seed,
		randomRingCases: N,
		randomRealInvariantCases: N,
		coefficientDomain: "Gaussian rationals Q(i)",
		frequencyGroup: `Z^${d} for randomized tests; Z for regressions`,
		exactArithmetic: true,
		toleranceUsed: false,
		failureCount: fail.length,
		failures: fail.slice(0, 50),
		mixedRegressionProduct: serial(mixed),
		zeroFrequencyRegressionProduct: serial(prod),
		verdict: fail.length === 0 ? "SURVIVED_IMPLEMENTATION_FALSIFICATION" : "REFUTED",
		prng: "mulberry32",
		note: "JS randomized cases use mulberry32, not Python random.Random. Regressions are seed-free."
	};
}
var LABELS = {
	coordinate_derivation: "D · coordinate",
	exact_translation: "T · exact shift",
	rational_directional_derivation: "D_v · rational",
	physical_derivative_sqrt2: "√2 derivative",
	shift_pi_over_4: "π/4 shift"
};
function Orb1View() {
	const [operatorId, setOperatorId] = (0, import_react.useState)("coordinate_derivation");
	const [ring, setRing] = (0, import_react.useState)(null);
	const [paging, setPaging] = (0, import_react.useState)("ok");
	const decision = (0, import_react.useMemo)(() => admitOperator(operatorId), [operatorId]);
	const page = paging === "ok" ? pageFrac(frac(1, 2)) : pageFrac(frac(PAGE_LIMIT, 1n));
	const units = [
		{
			label: "1",
			z: gq(1, 0)
		},
		{
			label: "i",
			z: gq(0, 1)
		},
		{
			label: "3/5+4/5 i",
			z: gq(frac(3, 5), frac(4, 5))
		},
		{
			label: "(1+i)/√2",
			z: null
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "ORB-1 admission"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
					children: "Exact arithmetic on Q(i)[Z^d]. Operators are admitted or quarantined by the coefficient ring. This is not Hodgeform Core, not LANGUAGE_LIMIT, and never EARNED."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: decision.decision === "ADMIT" ? "ok" : "warn",
					children: decision.decision
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: ORB1_OPERATORS.map((id) => {
					const row = admitOperator(id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOperatorId(id),
						className: cn("h-11 min-w-11 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150", id === operatorId ? "border-fg/30 bg-bg-subtle text-fg" : "border-border text-muted hover:border-border-strong hover:text-fg"),
						children: [LABELS[id] ?? id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-subtle",
							children: row.decision === "ADMIT" ? "A" : "Q"
						})]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
									children: decision.family
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: decision.inQi ? "ok" : "warn",
									children: decision.inQi ? "in Q(i)" : "not in Q(i)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "default",
									children: "coreLanguageLimit=false"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "default",
									children: "earned=false"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: decision.operatorId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: decision.reason
						}),
						decision.multiplierNeeded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-[11px] text-fg",
							children: ["needs ", decision.multiplierNeeded]
						}),
						decision.phasorNeeded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-[11px] text-fg",
							children: ["needs ", decision.phasorNeeded]
						}),
						decision.translationParameterDomain && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs leading-relaxed text-muted",
							children: decision.translationParameterDomain
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-xs leading-relaxed text-subtle",
							children: [
								"Scope: ",
								decision.scopeClaim,
								". Ring ",
								decision.ring,
								"."
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
							children: "Q(i) unit circle"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 font-mono text-[11px]",
							children: units.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: u.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: u.z ? isQiUnitCircle(u.z) ? "admitted phasor" : "not unit" : "not in Q(i)"
								})]
							}, u.label))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
								children: "16-bit paging · simulation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted",
								children: "Overflow if |n| or |d| ≥ 2^15. Not a register machine. Not the Tower VM."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "lg",
									variant: paging === "ok" ? "default" : "outline",
									onClick: () => setPaging("ok"),
									children: "1/2"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "lg",
									variant: paging === "overflow" ? "default" : "outline",
									onClick: () => setPaging("overflow"),
									children: "32768"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: page.status === "OK" ? "ok" : "fail",
									children: page.status
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[11px] text-muted",
									children: page.label
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-6 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Exact ring laws"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
						children: "80 mulberry32 cases plus seed-free regressions cos(t)sin(2t) and cos²(t). Not Python random.Random."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "lg",
						onClick: () => setRing(runStepZero({
							n: 80,
							d: 2,
							seed: 20260819
						})),
						children: "Run exact check"
					})]
				}), ring ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: ring.verdict.startsWith("SURVIVED") ? "ok" : "fail",
							children: ring.verdict
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[11px] text-muted",
							children: [
								"failures ",
								ring.failureCount,
								" · exact ",
								String(ring.exactArithmetic),
								" · tolerance",
								" ",
								String(ring.toleranceUsed)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-subtle",
						children: ring.note
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Not run yet. The ring is idle until you ask."
				})]
			})
		]
	});
}
var SCENARIOS = [
	{
		id: "refine",
		label: "REFINE"
	},
	{
		id: "quotient",
		label: "QUOTIENT"
	},
	{
		id: "route",
		label: "Route"
	},
	{
		id: "observe",
		label: "OBSERVE"
	},
	{
		id: "self_review",
		label: "No self-review"
	}
];
function FlmView() {
	const [id, setId] = (0, import_react.useState)("refine");
	const [demo, setDemo] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function run(next = id) {
		setBusy(true);
		setError(null);
		try {
			const row = await runFlmScenario({ data: { id: next } });
			setDemo(row);
		} catch (e) {
			setError(e instanceof Error ? e.message : "FLM demo failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "Fiber Lattice Machine"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
					children: "Finite kernel v0. The world ledger is immutable. Snapshots are views. Candidates are hash-bound and inert until a separate admission record. This is not Hodgeform Core, not LANGUAGE_LIMIT, and not a Tower VM."
				})] }), demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: demo.coreAdmission ? "fail" : "ok",
					children: ["coreAdmission=", String(demo.coreAdmission)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: SCENARIOS.map((s) => {
					const on = s.id === id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setId(s.id);
							run(s.id);
						},
						className: cn("h-11 min-w-11 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150", on ? "border-fg/30 bg-bg-subtle text-fg" : "border-border text-muted hover:border-border-strong hover:text-fg"),
						children: s.label
					}, s.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => void run(),
					disabled: busy,
					children: busy ? "Running kernel…" : demo ? "Run again" : "Run exact kernel"
				})
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-fail",
				children: error
			}),
			demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
									children: demo.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: demo.ledgerMutated ? "fail" : "ok",
									children: "ledger frozen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "default",
									children: "coreLanguageLimit=false"
								}),
								demo.selfReviewBlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "ok",
									children: "self-review blocked"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg text-fg",
							children: demo.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: demo.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Before adequate",
									value: fmt(demo.beforeAdequate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "After adequate",
									value: fmt(demo.afterAdequate)
								}),
								demo.viewKeys && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Keys",
									value: demo.viewKeys.join(", ") || "∅"
								}),
								demo.selectedId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Selected",
									value: demo.selectedId
								}),
								demo.candidateHash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Candidate",
									value: `${demo.candidateHash.slice(0, 16)}…`
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "Notes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: demo.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm leading-relaxed text-muted",
								children: n
							}, n))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-relaxed text-subtle",
							children: "Authority on the demo projection is labeled hodgeform only as the schema field. Guided did not call Core. The local hash is not a Core artifact hash."
						})
					]
				})]
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "min-w-0 break-all text-fg",
			children: value
		})]
	});
}
function fmt(v) {
	if (v === null) return "n/a";
	return v ? "true" : "false";
}
var SUITE = diagnoseSuite(LOCAL_FIBER_WORLDS);
var TABS = [
	{
		id: "fiber",
		label: "Fiber"
	},
	{
		id: "orb1",
		label: "ORB-1"
	},
	{
		id: "flm",
		label: "FLM"
	}
];
function TowerView() {
	const [tab, setTab] = (0, import_react.useState)("fiber");
	const [worldId, setWorldId] = (0, import_react.useState)(LOCAL_FIBER_WORLDS[0]?.id ?? "SUM-GT");
	const world = LOCAL_FIBER_WORLDS.find((w) => w.id === worldId) ?? LOCAL_FIBER_WORLDS[0];
	const audit = (0, import_react.useMemo)(() => world ? diagnoseWorld(world) : null, [world]);
	const snapshot = localLanguageSnapshot();
	const canonical = snapshotCanonical();
	if (!world || !audit) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 px-4 py-6 md:px-8 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
				children: "Language Tower"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl tracking-tight md:text-4xl",
				children: "Current executable L_t"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base",
				children: "Orbita is the epistemic governor. The Tower is the semantic substrate. This page is a finite fiber-collision control, a local Q(i) admission gate, and a Fiber Lattice Machine kernel — not the Tower VM, not a Core LANGUAGE_LIMIT certificate, and not Opaque Fiber v1.0.1."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
						label: "Local suite",
						value: `${SUITE.audits.filter((a) => a.matchesExpected).length}/${SUITE.audits.length} exact`,
						note: "Designer-supplied worlds. Not the sealed 18-world benchmark."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
						label: "LANGUAGE_LIMIT issued",
						value: "false",
						note: "A table search is not a grammar-wide theorem."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
						label: "Promotion",
						value: "disabled",
						note: "The Tower may propose L_t+1. It may not promote it."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Governed pipeline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: "Self-improvement is evidence-gated language repair. Origin is not evidence."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GovernedPipeline, { activeId: "auditor" })
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoreLanguageAdapters, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "First principle"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-fg",
							children: "Self-improvement is not self-editing. A finite miss is SEARCH_FAILURE. A language limit is a theorem on a frozen grammar. Exhausted search is not a theorem."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 flex gap-2 overflow-x-auto pb-1",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("h-11 shrink-0 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150", tab === t.id ? "border-fg/30 bg-bg-subtle text-fg" : "border-border text-muted hover:border-border-strong hover:text-fg"),
					children: t.label
				}, t.id))
			}),
			tab === "flm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-8 min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlmView, {})
			}) : tab === "orb1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-8 min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orb1View, {})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl tracking-tight",
							children: "Fiber auditor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
							children: "O factors through π iff O is constant on every fiber of π. Recovery uses only independent candidates. Target-derived and π-derived channels cannot count as new information."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: SUITE.falseHoles === 0 && SUITE.missedHoles === 0 ? "ok" : "fail",
							children: [
								SUITE.falseHoles,
								" false holes · ",
								SUITE.missedHoles,
								" missed"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: LOCAL_FIBER_WORLDS.map((w) => {
							const row = SUITE.audits.find((a) => a.worldId === w.id);
							const on = w.id === worldId;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setWorldId(w.id),
								className: cn("h-11 min-w-11 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150", on ? "border-fg/30 bg-bg-subtle text-fg" : "border-border text-muted hover:border-border-strong hover:text-fg"),
								children: [w.id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-subtle",
									children: row?.status === "HOLE" ? "H" : "N"
								})]
							}, w.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "min-w-0 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
											children: world.domain
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: audit.status === "HOLE" ? "warn" : "ok",
											children: audit.status
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: audit.matchesExpected ? "ok" : "fail",
											children: audit.matchesExpected ? "matches expected" : "mismatch"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 text-lg text-fg",
									children: world.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: world.adversarialRole
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 max-w-full overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left font-mono text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "text-subtle",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 pr-3 font-medium",
												children: "state"
											}), featureKeys(world).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
												className: "py-2 pr-3 font-medium",
												children: [
													k,
													world.piKeys.includes(k) ? " · π" : "",
													world.oKey === k ? " · O" : ""
												]
											}, k))]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: world.states.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t border-border text-fg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3",
												children: s.id
											}), featureKeys(world).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-3",
												children: String(s.features[k])
											}, k))]
										}, s.id)) })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
										children: "π fibers"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 space-y-2",
										children: audit.fibers.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: cn("rounded-[var(--radius-md)] border px-3 py-2 text-sm", f.collision ? "border-warn/40 bg-warn/10 text-fg" : "border-border text-muted"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[11px] text-fg",
												children: f.key || "∅"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-2 text-xs",
												children: [
													f.stateIds.join(", "),
													" · O = ",
													f.oValues.map(String).join(" | ")
												]
											})]
										}, f.key))
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
										children: "Collision witnesses"
									}), audit.witnesses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted",
										children: "None. Target is constant on every fiber."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 space-y-1 font-mono text-[11px] text-fg",
										children: audit.witnesses.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											w.x,
											" ~ ",
											w.y,
											" on π · O differs"
										] }, `${w.x}-${w.y}`))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
										children: "Overseparation"
									}), audit.overseparations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted",
										children: "No nuisance split on this table."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted",
										children: "Same O, different π. Repair would be compression, not expansion. Not applied here."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 space-y-1 font-mono text-[11px] text-fg",
										children: audit.overseparations.slice(0, 6).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											w.x,
											" / ",
											w.y
										] }, `${w.x}-${w.y}`))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
											children: "Provenance-safe recovery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
											className: "mt-2 space-y-1 font-mono text-[11px]",
											children: world.candidates.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
													className: "text-fg",
													children: [
														c.id,
														" · ",
														c.label
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "text-muted",
													children: c.provenance
												})]
											}, c.id))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 text-sm text-fg",
											children: audit.admittedRecoverySets.length === 0 ? "No admissible independent recovery." : audit.admittedRecoverySets.map((set) => set.join("+")).join(" ; ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs leading-relaxed text-muted",
											children: [
												"Scope: ",
												audit.scopeClaim,
												". languageLimitIssued=",
												String(audit.languageLimitIssued),
												". searchFailureIssued=",
												String(audit.searchFailureIssued),
												"."
											]
										})
									]
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "Language snapshot"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "mt-2 text-lg text-fg",
							children: [
								snapshot.language_id,
								" · ",
								snapshot.version
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: [
								snapshot.machine.kind,
								". not_the_tower_vm=",
								String(snapshot.machine.not_the_tower_vm),
								". promotion_enabled=",
								String(snapshot.promotion_enabled),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2 text-sm",
							children: snapshot.primitive_registry.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-baseline gap-x-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[11px] text-fg",
										children: p.symbol
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: p.grounding_status
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: p.admission
									})
								]
							}, p.symbol))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
								children: "Ignorance queue"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-2 text-sm text-muted",
								children: snapshot.ignorance_queue.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: g.kind
									}),
									" — ",
									g.note
								] }, g.gap_id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-[11px] leading-relaxed text-subtle",
							children: [
								"Canonical length ",
								canonical.length,
								". Local digest is not a Hodgeform Core hash."
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: "Stages A–I"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: "Progress is a milestone, not a benchmark score. Stage I is refused."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuperintelligenceStages, {})
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 pb-8 max-w-2xl text-sm leading-relaxed text-muted",
				children: "The Tower may discover that it needs to change. It may not decide by itself that the change is now true."
			})
		]
	});
}
function Callout({ label, value, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-lg text-fg",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted",
				children: note
			})
		]
	});
}
function featureKeys(world) {
	const keys = [];
	for (const s of world.states) for (const k of Object.keys(s.features)) if (!keys.includes(k)) keys.push(k);
	return keys;
}
function TowerPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerView, {});
}
//#endregion
export { TowerPage as component };
