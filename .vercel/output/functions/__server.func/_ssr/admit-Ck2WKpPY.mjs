//#region node_modules/.nitro/vite/services/ssr/assets/admit-Ck2WKpPY.js
function keyOf(features, keys) {
	return keys.map((k) => `${k}=${String(features[k])}`).join("|");
}
function groupBy(states, keys) {
	const g = /* @__PURE__ */ new Map();
	for (const s of states) {
		const k = keyOf(s.features, keys);
		const row = g.get(k);
		if (row) row.push(s);
		else g.set(k, [s]);
	}
	return g;
}
function oValues(states, oKey) {
	return [...new Set(states.map((s) => s.features[oKey]))];
}
function constantOn(states, oKey) {
	return oValues(states, oKey).length <= 1;
}
function subsets(items) {
	const out = [[]];
	for (const item of items) {
		const n = out.length;
		for (let i = 0; i < n; i += 1) out.push([...out[i], item]);
	}
	return out;
}
function diagnoseWorld(world) {
	const fibers = [];
	const witnesses = [];
	const grouped = groupBy(world.states, world.piKeys);
	for (const [key, states] of grouped) {
		const o = oValues(states, world.oKey);
		const collision = o.length > 1;
		fibers.push({
			key,
			stateIds: states.map((s) => s.id),
			oValues: o,
			collision
		});
		if (collision) {
			for (let i = 0; i < states.length; i += 1) for (let j = i + 1; j < states.length; j += 1) if (states[i].features[world.oKey] !== states[j].features[world.oKey]) witnesses.push({
				x: states[i].id,
				y: states[j].id,
				pi: key
			});
		}
	}
	const status = witnesses.length > 0 ? "HOLE" : "NO_HOLE";
	const overseparations = [];
	for (let i = 0; i < world.states.length; i += 1) for (let j = i + 1; j < world.states.length; j += 1) {
		const a = world.states[i];
		const b = world.states[j];
		const sameO = a.features[world.oKey] === b.features[world.oKey];
		const samePi = keyOf(a.features, world.piKeys) === keyOf(b.features, world.piKeys);
		if (sameO && !samePi) overseparations.push({
			x: a.id,
			y: b.id
		});
	}
	const provenance = {};
	for (const c of world.candidates) provenance[c.id] = c.provenance;
	const independent = world.candidates.filter((c) => c.provenance === "independent");
	const treatedAsGenuineNew = independent.map((c) => c.id);
	const notes = [
		"Finite exact fiber test only. Not a language-limit theorem.",
		"LANGUAGE_LIMIT is not issued from table search. SEARCH_FAILURE is not issued; the table is exhaustive.",
		"This auditor cannot promote a language version."
	];
	let admittedRecoverySets = [];
	if (status === "HOLE") {
		const valid = [];
		for (const set of subsets(independent)) {
			if (set.length === 0) continue;
			const keys = [...world.piKeys, ...set.flatMap((c) => c.keys)];
			if ([...groupBy(world.states, keys).values()].every((row) => constantOn(row, world.oKey))) valid.push(set.map((c) => c.id).sort());
		}
		const uniq = [...new Map(valid.map((ids) => [ids.join("+"), ids])).values()];
		const min = uniq.reduce((m, ids) => Math.min(m, ids.length), Infinity);
		admittedRecoverySets = uniq.filter((ids) => ids.length === min).sort((a, b) => a.join().localeCompare(b.join()));
		if (admittedRecoverySets.length === 0) notes.push("No admissible independent recovery in the supplied menu.");
	} else notes.push("NO_HOLE restraint: no recovery admitted on a sufficient representation.");
	return {
		worldId: world.id,
		status,
		matchesExpected: status === world.expectedStatus,
		fibers,
		witnesses,
		overseparations,
		provenance,
		admittedRecoverySets,
		treatedAsGenuineNew,
		scopeClaim: "finite_factorization_only",
		languageLimitIssued: false,
		searchFailureIssued: false,
		notes
	};
}
function diagnoseSuite(worlds) {
	const audits = worlds.map(diagnoseWorld);
	const n = audits.length || 1;
	const falseHoles = audits.filter((a) => a.status === "HOLE" && !a.matchesExpected).length;
	const missedHoles = audits.filter((a) => a.status === "NO_HOLE" && !a.matchesExpected).length;
	return {
		audits,
		statusAccuracy: audits.filter((a) => a.matchesExpected).length / n,
		falseHoles,
		missedHoles,
		languageLimitIssued: false
	};
}
/** Local Guided controls. Not Opaque Fiber v1.0.1 and not Hodgeform Core. */
var LOCAL_FIBER_WORLDS = [
	{
		id: "SUM-GT",
		name: "Sum loses ordering",
		domain: "finite arithmetic",
		adversarialRole: "manifesto coarse hole",
		expectedStatus: "HOLE",
		piKeys: ["sum"],
		oKey: "gt",
		states: [
			{
				id: "s00",
				features: {
					x: 0,
					y: 0,
					sum: 0,
					gt: 0
				}
			},
			{
				id: "s01",
				features: {
					x: 0,
					y: 1,
					sum: 1,
					gt: 0
				}
			},
			{
				id: "s10",
				features: {
					x: 1,
					y: 0,
					sum: 1,
					gt: 1
				}
			},
			{
				id: "s11",
				features: {
					x: 1,
					y: 1,
					sum: 2,
					gt: 0
				}
			}
		],
		candidates: [
			{
				id: "P1",
				label: "x",
				keys: ["x"],
				provenance: "independent"
			},
			{
				id: "P2",
				label: "y",
				keys: ["y"],
				provenance: "independent"
			},
			{
				id: "P3",
				label: "sum",
				keys: ["sum"],
				provenance: "pi_derived"
			}
		]
	},
	{
		id: "XOR-PAIR",
		name: "Pair-only XOR recovery",
		domain: "Boolean",
		adversarialRole: "pair_only_recovery",
		expectedStatus: "HOLE",
		piKeys: ["const"],
		oKey: "xor",
		states: [
			{
				id: "ab00",
				features: {
					a: 0,
					b: 0,
					const: 0,
					xor: 0
				}
			},
			{
				id: "ab01",
				features: {
					a: 0,
					b: 1,
					const: 0,
					xor: 1
				}
			},
			{
				id: "ab10",
				features: {
					a: 1,
					b: 0,
					const: 0,
					xor: 1
				}
			},
			{
				id: "ab11",
				features: {
					a: 1,
					b: 1,
					const: 0,
					xor: 0
				}
			}
		],
		candidates: [
			{
				id: "P1",
				label: "a",
				keys: ["a"],
				provenance: "independent"
			},
			{
				id: "P2",
				label: "b",
				keys: ["b"],
				provenance: "independent"
			},
			{
				id: "P3",
				label: "const",
				keys: ["const"],
				provenance: "pi_derived"
			}
		]
	},
	{
		id: "AB-OK",
		name: "Target already in pi",
		domain: "Boolean",
		adversarialRole: "NO_HOLE_restraint",
		expectedStatus: "NO_HOLE",
		piKeys: ["a", "b"],
		oKey: "a",
		states: [
			{
				id: "t00",
				features: {
					a: 0,
					b: 0
				}
			},
			{
				id: "t01",
				features: {
					a: 0,
					b: 1
				}
			},
			{
				id: "t10",
				features: {
					a: 1,
					b: 0
				}
			},
			{
				id: "t11",
				features: {
					a: 1,
					b: 1
				}
			}
		],
		candidates: [{
			id: "P1",
			label: "unused z",
			keys: ["b"],
			provenance: "independent"
		}, {
			id: "P2",
			label: "a copy",
			keys: ["a"],
			provenance: "pi_derived"
		}]
	},
	{
		id: "LEAK-O",
		name: "Target-derived trap",
		domain: "Boolean",
		adversarialRole: "target_derived_leakage",
		expectedStatus: "HOLE",
		piKeys: ["const"],
		oKey: "xor",
		states: [
			{
				id: "k00",
				features: {
					a: 0,
					b: 0,
					const: 0,
					xor: 0
				}
			},
			{
				id: "k01",
				features: {
					a: 0,
					b: 1,
					const: 0,
					xor: 1
				}
			},
			{
				id: "k10",
				features: {
					a: 1,
					b: 0,
					const: 0,
					xor: 1
				}
			},
			{
				id: "k11",
				features: {
					a: 1,
					b: 1,
					const: 0,
					xor: 0
				}
			}
		],
		candidates: [
			{
				id: "P1",
				label: "copy of O",
				keys: ["xor"],
				provenance: "target_derived"
			},
			{
				id: "P2",
				label: "a",
				keys: ["a"],
				provenance: "independent"
			},
			{
				id: "P3",
				label: "b",
				keys: ["b"],
				provenance: "independent"
			}
		]
	},
	{
		id: "CLOCK",
		name: "Nuisance step counter",
		domain: "state abstraction",
		adversarialRole: "overseparation / nuisance",
		expectedStatus: "NO_HOLE",
		piKeys: ["a", "clock"],
		oKey: "a",
		states: [
			{
				id: "c0",
				features: {
					a: 0,
					clock: 0
				}
			},
			{
				id: "c1",
				features: {
					a: 0,
					clock: 1
				}
			},
			{
				id: "c2",
				features: {
					a: 1,
					clock: 0
				}
			},
			{
				id: "c3",
				features: {
					a: 1,
					clock: 1
				}
			}
		],
		candidates: [{
			id: "P1",
			label: "clock",
			keys: ["clock"],
			provenance: "independent"
		}]
	},
	{
		id: "NONE",
		name: "Hole with no admissible channel",
		domain: "finite arithmetic",
		adversarialRole: "no_supplied_recovery",
		expectedStatus: "HOLE",
		piKeys: ["sum"],
		oKey: "gt",
		states: [
			{
				id: "n00",
				features: {
					x: 0,
					y: 0,
					sum: 0,
					gt: 0
				}
			},
			{
				id: "n01",
				features: {
					x: 0,
					y: 1,
					sum: 1,
					gt: 0
				}
			},
			{
				id: "n10",
				features: {
					x: 1,
					y: 0,
					sum: 1,
					gt: 1
				}
			},
			{
				id: "n11",
				features: {
					x: 1,
					y: 1,
					sum: 2,
					gt: 0
				}
			}
		],
		candidates: [{
			id: "P1",
			label: "gt copy",
			keys: ["gt"],
			provenance: "target_derived"
		}, {
			id: "P2",
			label: "sum",
			keys: ["sum"],
			provenance: "pi_derived"
		}]
	}
];
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
	const obj = value;
	return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
var LOCAL_WORLD_IDS = [
	"SUM-GT",
	"XOR-PAIR",
	"AB-OK",
	"LEAK-O",
	"CLOCK",
	"NONE"
];
function localLanguageSnapshot() {
	return {
		language_id: "hodgeform-guided-preview-tower",
		version: "0.1.0-preview",
		parent_language_hash: null,
		machine: {
			kind: "lexical-bm25 + finite-fiber-auditor",
			not_the_tower_vm: true,
			word_size: null
		},
		primitive_registry: [
			{
				symbol: "retrieve",
				grounding_status: "IDENTITY_ONLY",
				origin: "DESIGNER_SUPPLIED",
				admission: "BUILT_IN",
				validation: "PARTIAL"
			},
			{
				symbol: "fiber_diagnose",
				grounding_status: "STRUCTURALLY_GROUNDED",
				origin: "DESIGNER_SUPPLIED",
				admission: "BUILT_IN",
				validation: "PARTIAL"
			},
			{
				symbol: "orb1_admit",
				grounding_status: "STRUCTURALLY_GROUNDED",
				origin: "DESIGNER_SUPPLIED",
				admission: "BUILT_IN",
				validation: "PARTIAL"
			},
			{
				symbol: "flm_audit",
				grounding_status: "STRUCTURALLY_GROUNDED",
				origin: "DESIGNER_SUPPLIED",
				admission: "BUILT_IN",
				validation: "PARTIAL"
			},
			{
				symbol: "color_order",
				grounding_status: "UNRESOLVED",
				origin: "DESIGNER_SUPPLIED",
				admission: "PROVISIONAL",
				validation: "UNVALIDATED"
			}
		],
		grammar: {
			constructors: [
				"finite_table",
				"pi_keys",
				"target_key",
				"candidate_channel"
			],
			read_ops: [
				"retrieve",
				"diagnose",
				"snapshot",
				"admit",
				"flm"
			],
			write_ops: []
		},
		known_invariances: [],
		known_boundaries: [
			"BM25 retrieval is not executable meaning.",
			"Retrieval is not the Language Tower.",
			"Fiber HOLE is not LANGUAGE_LIMIT.",
			"Q(i) coefficient-ring quarantine is not Core LANGUAGE_LIMIT.",
			"FLM candidate hashes are not Hodgeform Core admission.",
			"Local digest is not a Hodgeform Core hash.",
			"No language version can self-promote."
		],
		ignorance_queue: [
			{
				gap_id: "gap-tower-vm",
				kind: "MISSING_OPERATOR",
				note: "Executable Language Tower VM is not in this repository."
			},
			{
				gap_id: "gap-symmetry-hunter",
				kind: "LANGUAGE_LIMIT",
				note: "Transformation Hunter is specified, not implemented."
			},
			{
				gap_id: "gap-orbl-earn",
				kind: "MISSING_EXPERIMENT",
				note: "No EARNED primitive has passed prospective selectivity here."
			}
		],
		local_fiber_worlds: [...LOCAL_WORLD_IDS],
		promotion_enabled: false
	};
}
function snapshotCanonical() {
	return stableStringify(localLanguageSnapshot());
}
var BASE = {
	ring: "Q(i)[Z^d]",
	coreLanguageLimit: false,
	earned: false,
	scopeClaim: "coefficient_ring_only"
};
var TRANSLATION_DOMAIN = "u in (Q(i) unit circle)^d, exact phasors with u*conj(u)=1";
var ORB1_OPERATORS = [
	"coordinate_derivation",
	"exact_translation",
	"rational_directional_derivation",
	"physical_derivative_sqrt2",
	"shift_pi_over_4"
];
function aliases(raw) {
	const id = raw.trim().toLowerCase().replace(/\s+/g, "_");
	if (id === "d" || id === "d_j" || id === "coordinate_derivations") return "coordinate_derivation";
	if (id === "t" || id === "t_u" || id === "exact_translations") return "exact_translation";
	if (id === "directional" || id === "rational_directional_derivations") return "rational_directional_derivation";
	if (id === "sqrt2" || id === "√2" || id === "physical_derivative") return "physical_derivative_sqrt2";
	if (id === "pi/4" || id === "π/4" || id === "shift_pi4") return "shift_pi_over_4";
	return id;
}
function admitOperator(raw) {
	const operatorId = aliases(raw);
	if (operatorId === "coordinate_derivation") return {
		...BASE,
		operatorId,
		family: "coordinate_derivations",
		decision: "ADMIT",
		inQi: true,
		reason: "D_j multiplies mode n by i·n_j. Integer n_j keeps the coefficient in Q(i)."
	};
	if (operatorId === "exact_translation") return {
		...BASE,
		operatorId,
		family: "exact_translations",
		decision: "ADMIT",
		inQi: true,
		reason: "T_u is admitted when every phasor u_j lies on the Q(i) unit circle (a²+b²=1 in Q). Gaussian integer units 1,-1,i,-i are included. (3/5)+(4/5)i is included. (1+i)/√2 is not in Q(i).",
		translationParameterDomain: TRANSLATION_DOMAIN
	};
	if (operatorId === "rational_directional_derivation") return {
		...BASE,
		operatorId,
		family: "rational_directional_derivations",
		decision: "ADMIT",
		inQi: true,
		reason: "Directional D_v = Σ v_j D_j is admitted when each v_j is in Q."
	};
	if (operatorId === "physical_derivative_sqrt2") return {
		...BASE,
		operatorId,
		family: "language_limit_of_ring",
		decision: "QUARANTINE",
		inQi: false,
		multiplierNeeded: "i*sqrt(2)*n",
		reason: "sqrt(2) is irrational, while every Q(i) element has rational real and imaginary parts. This is a coefficient-ring limit of Q(i)[Z^d], not a Hodgeform Core LANGUAGE_LIMIT, and it is never EARNED."
	};
	if (operatorId === "shift_pi_over_4") return {
		...BASE,
		operatorId,
		family: "language_limit_of_ring",
		decision: "QUARANTINE",
		inQi: false,
		phasorNeeded: "(1+i)/sqrt(2)",
		reason: "1/sqrt(2) is irrational, so the π/4 phasor is not in Q(i). This is a coefficient-ring limit of Q(i)[Z^d], not a Hodgeform Core LANGUAGE_LIMIT, and it is never EARNED."
	};
	return {
		...BASE,
		operatorId: operatorId || "unknown",
		family: "unknown",
		decision: "QUARANTINE",
		inQi: false,
		reason: "Unknown operator. Fail closed. Local admission does not invent Core theorems."
	};
}
//#endregion
export { diagnoseWorld as a, diagnoseSuite as i, ORB1_OPERATORS as n, localLanguageSnapshot as o, admitOperator as r, snapshotCanonical as s, LOCAL_FIBER_WORLDS as t };
