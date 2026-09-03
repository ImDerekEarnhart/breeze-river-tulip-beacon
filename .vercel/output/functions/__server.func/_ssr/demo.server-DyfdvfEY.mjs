import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/demo.server-DyfdvfEY.js
function canonicalize(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
	const object = value;
	return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`).join(",")}}`;
}
function uniqueSorted(values) {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
function hashArtifact(value) {
	return createHash("sha256").update(canonicalize(value)).digest("hex");
}
function projectExternalAdmission(candidate, projection) {
	if (projection.candidateHash !== candidate.candidateHash) throw new Error("Admission projection is not bound to the exact candidate hash");
	if (!projection.reviewRef.trim()) throw new Error("External review reference is required");
	if (!projection.reviewer.trim()) throw new Error("External reviewer identity is required");
	if (projection.reviewer === candidate.proposedBy) throw new Error("Candidate proposer cannot self-review a semantic delta");
	const normalized = Object.freeze({
		...projection,
		evidenceHashes: Object.freeze([...projection.evidenceHashes].sort()),
		limitations: Object.freeze([...projection.limitations])
	});
	return Object.freeze({
		projection: normalized,
		admissionRecordHash: hashArtifact(normalized)
	});
}
function normalizeSemantic(semantic) {
	switch (semantic.kind) {
		case "REFINE": return Object.freeze({
			kind: "REFINE",
			parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds]),
			addViewKeys: Object.freeze(uniqueSorted(semantic.addViewKeys))
		});
		case "QUOTIENT": return Object.freeze({
			kind: "QUOTIENT",
			parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds]),
			removeViewKeys: Object.freeze(uniqueSorted(semantic.removeViewKeys))
		});
		case "OBSERVE": return Object.freeze({
			kind: "OBSERVE",
			parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds]),
			addObservationKeys: Object.freeze(uniqueSorted(semantic.addObservationKeys)),
			executionRequested: false
		});
		case "MERGE": return Object.freeze({
			kind: "MERGE",
			parentSnapshotIds: Object.freeze([...semantic.parentSnapshotIds].sort()),
			mergeStrategy: "union-visible-keys"
		});
	}
}
function createCandidateDelta(input) {
	const semantic = normalizeSemantic(input.semantic);
	const core = {
		id: input.id,
		proposedBy: input.proposedBy,
		rationale: input.rationale,
		scopeTargetIds: input.scopeTargetIds === "*" ? "*" : Object.freeze(uniqueSorted(input.scopeTargetIds)),
		semantic
	};
	return Object.freeze({
		...core,
		candidateHash: hashArtifact(core)
	});
}
function createWorldLedger(id, states) {
	const seen = /* @__PURE__ */ new Set();
	const frozenStates = states.map((state) => {
		if (seen.has(state.id)) throw new Error(`Duplicate world-state id: ${state.id}`);
		seen.add(state.id);
		const facts = Object.freeze({ ...state.facts });
		return Object.freeze({
			id: state.id,
			facts
		});
	});
	return Object.freeze({
		id,
		states: Object.freeze(frozenStates)
	});
}
function rawFact(ledger, stateId, key) {
	return ledger.states.find((state) => state.id === stateId)?.facts[key];
}
function visibleKeys(snapshot) {
	return uniqueSorted([...snapshot.viewKeys, ...snapshot.observationKeys]);
}
function representationKey(state, keys) {
	return canonicalize(keys.map((key) => [key, Object.prototype.hasOwnProperty.call(state.facts, key) ? state.facts[key] : { __flm_missing__: true }]));
}
function requiredFact(state, key) {
	if (!Object.prototype.hasOwnProperty.call(state.facts, key)) throw new Error(`Target fact ${key} is missing from world state ${state.id}`);
	return state.facts[key];
}
function partition(ledger, snapshot) {
	const keys = visibleKeys(snapshot);
	const groups = /* @__PURE__ */ new Map();
	for (const state of ledger.states) {
		const key = representationKey(state, keys);
		const row = groups.get(key);
		if (row) row.push(state);
		else groups.set(key, [state]);
	}
	return groups;
}
function targetKeys(contract) {
	return uniqueSorted([contract.targetKey, ...contract.protectedTargetKeys]);
}
function uniqueScalars(values) {
	const seen = /* @__PURE__ */ new Map();
	for (const value of values) seen.set(canonicalize(value), value);
	return [...seen.values()];
}
function auditFibers(ledger, snapshot, contract) {
	if (ledger.id !== snapshot.worldLedgerId) throw new Error(`Snapshot ${snapshot.id} belongs to ${snapshot.worldLedgerId}, not ${ledger.id}`);
	const collisions = [];
	const groups = partition(ledger, snapshot);
	for (const [key, states] of groups) for (const targetKey of targetKeys(contract)) {
		const values = uniqueScalars(states.map((state) => requiredFact(state, targetKey)));
		if (values.length > 1) collisions.push({
			targetKey,
			representationKey: key,
			stateIds: states.map((state) => state.id).sort(),
			targetValues: values
		});
	}
	return Object.freeze({
		snapshotId: snapshot.id,
		targetContractId: contract.id,
		visibleKeys: Object.freeze(visibleKeys(snapshot)),
		adequate: collisions.length === 0,
		collisions: Object.freeze(collisions)
	});
}
function auditNuisanceSplits(ledger, snapshot, contract) {
	const keys = visibleKeys(snapshot);
	const protectedKeys = targetKeys(contract);
	const splits = [];
	for (let i = 0; i < ledger.states.length; i += 1) for (let j = i + 1; j < ledger.states.length; j += 1) {
		const a = ledger.states[i];
		const b = ledger.states[j];
		if (!protectedKeys.every((key) => requiredFact(a, key) === requiredFact(b, key))) continue;
		const aRep = representationKey(a, keys);
		const bRep = representationKey(b, keys);
		if (aRep === bRep) continue;
		const sameTargetValues = {};
		for (const key of protectedKeys) sameTargetValues[key] = requiredFact(a, key);
		splits.push({
			stateA: a.id,
			stateB: b.id,
			sameTargetValues: Object.freeze(sameTargetValues),
			representationA: aRep,
			representationB: bRep
		});
	}
	return Object.freeze({
		snapshotId: snapshot.id,
		targetContractId: contract.id,
		splits: Object.freeze(splits)
	});
}
function buildSnapshot(candidate, admission, parents) {
	const semantic = candidate.semantic;
	if (semantic.parentSnapshotIds.length !== parents.length) throw new Error("Parent snapshot count does not match semantic delta");
	const parentIds = parents.map((p) => p.id).sort();
	const expectedIds = [...semantic.parentSnapshotIds].sort();
	if (parentIds.join("\0") !== expectedIds.join("\0")) throw new Error("Semantic delta parent ids do not match supplied parent snapshots");
	if (new Set(parents.map((p) => p.worldLedgerId)).size !== 1) throw new Error("Cannot combine representation snapshots from different world ledgers");
	let viewKeys;
	let observationKeys;
	let complexity;
	let scope = candidate.scopeTargetIds;
	if (semantic.kind === "REFINE") {
		const parent = parents[0];
		viewKeys = uniqueSorted([...parent.viewKeys, ...semantic.addViewKeys]);
		observationKeys = [...parent.observationKeys];
		complexity = parent.complexity + semantic.addViewKeys.length;
		scope = candidate.scopeTargetIds;
	} else if (semantic.kind === "QUOTIENT") {
		const parent = parents[0];
		const remove = new Set(semantic.removeViewKeys);
		viewKeys = parent.viewKeys.filter((key) => !remove.has(key));
		observationKeys = [...parent.observationKeys];
		complexity = Math.max(0, parent.complexity - semantic.removeViewKeys.length);
		scope = candidate.scopeTargetIds;
	} else if (semantic.kind === "OBSERVE") {
		const parent = parents[0];
		viewKeys = [...parent.viewKeys];
		observationKeys = uniqueSorted([...parent.observationKeys, ...semantic.addObservationKeys]);
		complexity = parent.complexity + semantic.addObservationKeys.length;
		scope = candidate.scopeTargetIds;
	} else {
		const [left, right] = parents;
		viewKeys = uniqueSorted([...left.viewKeys, ...right.viewKeys]);
		observationKeys = uniqueSorted([...left.observationKeys, ...right.observationKeys]);
		complexity = (/* @__PURE__ */ new Set([...viewKeys, ...observationKeys])).size;
		scope = candidate.scopeTargetIds;
	}
	const core = {
		id: `R-${candidate.candidateHash.slice(0, 12)}`,
		label: `${semantic.kind}:${candidate.id}`,
		worldLedgerId: parents[0].worldLedgerId,
		parentSnapshotIds: Object.freeze(parentIds),
		viewKeys: Object.freeze(uniqueSorted(viewKeys)),
		observationKeys: Object.freeze(uniqueSorted(observationKeys)),
		scopeTargetIds: scope,
		complexity,
		admissionRecordHash: admission.admissionRecordHash
	};
	return Object.freeze(core);
}
var RepresentationRegistry = class {
	#snapshots = /* @__PURE__ */ new Map();
	constructor(rootSnapshots) {
		for (const snapshot of rootSnapshots) {
			if (snapshot.admissionRecordHash !== null) throw new Error("Root snapshots must be designer-supplied roots with null admissionRecordHash");
			this.#snapshots.set(snapshot.id, snapshot);
		}
	}
	size() {
		return this.#snapshots.size;
	}
	list() {
		return [...this.#snapshots.values()].sort((a, b) => a.id.localeCompare(b.id));
	}
	get(id) {
		return this.#snapshots.get(id);
	}
	admit(candidate, admission) {
		if (admission.projection.decision !== "admit") throw new Error("Rejected candidate cannot enter the representation registry");
		if (admission.projection.candidateHash !== candidate.candidateHash) throw new Error("Admission record does not match candidate hash");
		const snapshot = buildSnapshot(candidate, admission, candidate.semantic.parentSnapshotIds.map((id) => {
			const snapshot = this.#snapshots.get(id);
			if (!snapshot) throw new Error(`Unknown parent snapshot: ${id}`);
			return snapshot;
		}));
		const existing = this.#snapshots.get(snapshot.id);
		if (existing) return existing;
		this.#snapshots.set(snapshot.id, snapshot);
		return snapshot;
	}
};
function createRootSnapshot(input) {
	const viewKeys = uniqueSorted(input.viewKeys);
	const observationKeys = uniqueSorted(input.observationKeys ?? []);
	return Object.freeze({
		id: input.id,
		label: input.label,
		worldLedgerId: input.worldLedgerId,
		parentSnapshotIds: Object.freeze([]),
		viewKeys: Object.freeze(viewKeys),
		observationKeys: Object.freeze(observationKeys),
		scopeTargetIds: input.scopeTargetIds === void 0 || input.scopeTargetIds === "*" ? "*" : Object.freeze(uniqueSorted(input.scopeTargetIds)),
		complexity: input.complexity ?? (/* @__PURE__ */ new Set([...viewKeys, ...observationKeys])).size,
		admissionRecordHash: null
	});
}
function inScope(snapshot, contract) {
	return snapshot.scopeTargetIds === "*" || snapshot.scopeTargetIds.includes(contract.id);
}
function routeLeastAdequate(ledger, contract, snapshots) {
	const adequate = snapshots.filter((snapshot) => {
		if (snapshot.worldLedgerId !== ledger.id || !inScope(snapshot, contract)) return false;
		if (contract.maxRepresentationCost !== void 0 && snapshot.complexity > contract.maxRepresentationCost) return false;
		return auditFibers(ledger, snapshot, contract).adequate;
	});
	adequate.sort((a, b) => {
		if (a.complexity !== b.complexity) return a.complexity - b.complexity;
		const aWidth = (/* @__PURE__ */ new Set([...a.viewKeys, ...a.observationKeys])).size;
		const bWidth = (/* @__PURE__ */ new Set([...b.viewKeys, ...b.observationKeys])).size;
		if (aWidth !== bWidth) return aWidth - bWidth;
		return a.id.localeCompare(b.id);
	});
	return Object.freeze({
		targetContractId: contract.id,
		selected: adequate[0] ?? null,
		adequateSnapshotIds: Object.freeze(adequate.map((snapshot) => snapshot.id))
	});
}
var demo_server_exports = /* @__PURE__ */ __exportAll({
	FLM_DEMO_IDS: () => FLM_DEMO_IDS,
	runFlmDemo: () => runFlmDemo
});
var FLM_DEMO_IDS = [
	"refine",
	"quotient",
	"route",
	"observe",
	"self_review"
];
function admit(candidate, reviewer = "reviewer-1") {
	return projectExternalAdmission(candidate, {
		candidateHash: candidate.candidateHash,
		decision: "admit",
		authority: "hodgeform",
		reviewer,
		reviewRef: "hodgeform://guided-local/flm/demo",
		evidenceHashes: ["evidence-b", "evidence-a"],
		limitations: ["finite exact world only", "local projection is not Core approval"],
		reviewedAt: "2026-08-21T20:00:00.000Z"
	});
}
function packAudit(audit) {
	return {
		adequate: audit.adequate,
		collisions: audit.collisions.length
	};
}
function runFlmDemo(id) {
	const key = FLM_DEMO_IDS.includes(id) ? id : "refine";
	if (key === "refine") return demoRefine();
	if (key === "quotient") return demoQuotient();
	if (key === "route") return demoRoute();
	if (key === "observe") return demoObserve();
	return demoSelfReview();
}
function demoRefine() {
	const ledger = createWorldLedger("sum-world", [
		{
			id: "a",
			facts: {
				x: 0,
				y: 1,
				sum: 1,
				gt: 0
			}
		},
		{
			id: "b",
			facts: {
				x: 1,
				y: 0,
				sum: 1,
				gt: 1
			}
		},
		{
			id: "c",
			facts: {
				x: 1,
				y: 1,
				sum: 2,
				gt: 0
			}
		}
	]);
	const target = {
		id: "gt-target",
		targetKey: "gt",
		protectedTargetKeys: [],
		allowedObservationKeys: []
	};
	const root = createRootSnapshot({
		id: "R0",
		label: "sum only",
		worldLedgerId: ledger.id,
		viewKeys: ["sum"]
	});
	const before = auditFibers(ledger, root, target);
	const candidate = createCandidateDelta({
		id: "add-x",
		proposedBy: "model-A",
		rationale: "x separates the sum=1 target collision",
		scopeTargetIds: [target.id],
		semantic: {
			kind: "REFINE",
			parentSnapshotIds: [root.id],
			addViewKeys: ["x"]
		}
	});
	const registry = new RepresentationRegistry([root]);
	const sizeBefore = registry.size();
	const refined = registry.admit(candidate, admit(candidate));
	const after = auditFibers(ledger, refined, target);
	return {
		id: "refine",
		title: "REFINE",
		body: "Add visible key x. The sum=1 fiber collision on gt is gone. Candidate generation did not mutate the registry.",
		beforeAdequate: before.adequate,
		afterAdequate: after.adequate,
		ledgerMutated: false,
		coreLanguageLimit: false,
		coreAdmission: false,
		selfReviewBlocked: false,
		candidateHash: candidate.candidateHash,
		viewKeys: [...refined.viewKeys],
		notes: [
			`registry ${sizeBefore} → ${registry.size()}`,
			`collisions ${before.collisions.length} → ${after.collisions.length}`,
			packAudit(before).adequate === false && packAudit(after).adequate === true ? "partition refined" : "unexpected audit"
		]
	};
}
function demoQuotient() {
	const ledger = createWorldLedger("camera-world", [
		{
			id: "a",
			facts: {
				signal: 0,
				camera: "A",
				on: 0,
				cameraTarget: "A"
			}
		},
		{
			id: "b",
			facts: {
				signal: 0,
				camera: "B",
				on: 0,
				cameraTarget: "B"
			}
		},
		{
			id: "c",
			facts: {
				signal: 1,
				camera: "A",
				on: 1,
				cameraTarget: "A"
			}
		},
		{
			id: "d",
			facts: {
				signal: 1,
				camera: "B",
				on: 1,
				cameraTarget: "B"
			}
		}
	]);
	const onTarget = {
		id: "on-target",
		targetKey: "on",
		protectedTargetKeys: [],
		allowedObservationKeys: []
	};
	const cameraTarget = {
		id: "camera-target",
		targetKey: "cameraTarget",
		protectedTargetKeys: [],
		allowedObservationKeys: []
	};
	const rich = createRootSnapshot({
		id: "R-rich",
		label: "signal+camera",
		worldLedgerId: ledger.id,
		viewKeys: ["signal", "camera"],
		complexity: 2
	});
	const hashBefore = hashArtifact(ledger);
	const splits = auditNuisanceSplits(ledger, rich, onTarget).splits.length;
	const candidate = createCandidateDelta({
		id: "drop-camera-for-on",
		proposedBy: "model-A",
		rationale: "camera is nuisance for on/off target",
		scopeTargetIds: [onTarget.id],
		semantic: {
			kind: "QUOTIENT",
			parentSnapshotIds: [rich.id],
			removeViewKeys: ["camera"]
		}
	});
	const quotient = new RepresentationRegistry([rich]).admit(candidate, admit(candidate));
	return {
		id: "quotient",
		title: "QUOTIENT",
		body: "Drop camera from the on-target view. Raw camera facts remain. Adequacy is target-scoped: on holds, camera identity does not.",
		beforeAdequate: true,
		afterAdequate: auditFibers(ledger, quotient, onTarget).adequate,
		ledgerMutated: false,
		coreLanguageLimit: false,
		coreAdmission: false,
		selfReviewBlocked: false,
		candidateHash: candidate.candidateHash,
		viewKeys: [...quotient.viewKeys],
		notes: [
			`nuisance splits before ${splits}`,
			`raw b.camera=${String(rawFact(ledger, "b", "camera"))}`,
			`ledger hash unchanged ${hashArtifact(ledger) === hashBefore}`,
			`camera target adequate=${auditFibers(ledger, quotient, cameraTarget).adequate}`
		]
	};
}
function demoRoute() {
	const ledger = createWorldLedger("routing-world", [
		{
			id: "a",
			facts: {
				signal: 0,
				camera: "A",
				on: 0
			}
		},
		{
			id: "b",
			facts: {
				signal: 0,
				camera: "B",
				on: 0
			}
		},
		{
			id: "c",
			facts: {
				signal: 1,
				camera: "A",
				on: 1
			}
		},
		{
			id: "d",
			facts: {
				signal: 1,
				camera: "B",
				on: 1
			}
		}
	]);
	const target = {
		id: "on-target",
		targetKey: "on",
		protectedTargetKeys: [],
		allowedObservationKeys: []
	};
	const rich = createRootSnapshot({
		id: "R-rich",
		label: "rich",
		worldLedgerId: ledger.id,
		viewKeys: ["signal", "camera"],
		complexity: 2
	});
	const signal = createRootSnapshot({
		id: "R-signal",
		label: "signal",
		worldLedgerId: ledger.id,
		viewKeys: ["signal"],
		complexity: 1
	});
	const decision = routeLeastAdequate(ledger, target, [
		rich,
		createRootSnapshot({
			id: "R-empty",
			label: "empty",
			worldLedgerId: ledger.id,
			viewKeys: [],
			complexity: 0
		}),
		signal
	]);
	return {
		id: "route",
		title: "Least adequate",
		body: "Route to the cheapest adequate snapshot, not the richest. Empty is inadequate. Signal beats signal+camera.",
		beforeAdequate: null,
		afterAdequate: decision.selected?.id === "R-signal",
		ledgerMutated: false,
		coreLanguageLimit: false,
		coreAdmission: false,
		selfReviewBlocked: false,
		selectedId: decision.selected?.id ?? null,
		viewKeys: decision.selected ? [...decision.selected.viewKeys] : [],
		notes: [`adequate=${decision.adequateSnapshotIds.join(",")}`]
	};
}
function demoObserve() {
	const ledger = createWorldLedger("observe-world", [{
		id: "a",
		facts: {
			base: 0,
			sensor: 0,
			target: 0
		}
	}, {
		id: "b",
		facts: {
			base: 0,
			sensor: 1,
			target: 1
		}
	}]);
	const target = {
		id: "sensor-target",
		targetKey: "target",
		protectedTargetKeys: [],
		allowedObservationKeys: ["sensor"]
	};
	const root = createRootSnapshot({
		id: "R0",
		label: "base",
		worldLedgerId: ledger.id,
		viewKeys: ["base"]
	});
	const before = auditFibers(ledger, root, target);
	const candidate = createCandidateDelta({
		id: "observe-sensor",
		proposedBy: "model-A",
		rationale: "sensor is an allowed missing observation",
		scopeTargetIds: [target.id],
		semantic: {
			kind: "OBSERVE",
			parentSnapshotIds: [root.id],
			addObservationKeys: ["sensor"],
			executionRequested: false
		}
	});
	const observed = new RepresentationRegistry([root]).admit(candidate, admit(candidate));
	const after = auditFibers(ledger, observed, target);
	return {
		id: "observe",
		title: "OBSERVE",
		body: "Admit an allowed observation channel as a view. This kernel never executes the observation.",
		beforeAdequate: before.adequate,
		afterAdequate: after.adequate,
		ledgerMutated: false,
		coreLanguageLimit: false,
		coreAdmission: false,
		selfReviewBlocked: false,
		candidateHash: candidate.candidateHash,
		viewKeys: [...observed.observationKeys],
		notes: [`executionRequested=${candidate.semantic.kind === "OBSERVE" ? candidate.semantic.executionRequested : "n/a"}`, `observationKeys=${observed.observationKeys.join(",")}`]
	};
}
function demoSelfReview() {
	const candidate = createCandidateDelta({
		id: "observe-z",
		proposedBy: "model-A",
		rationale: "request a missing admissible channel",
		scopeTargetIds: ["target-z"],
		semantic: {
			kind: "OBSERVE",
			parentSnapshotIds: [createRootSnapshot({
				id: "R0",
				label: "base",
				worldLedgerId: "observe-world",
				viewKeys: ["base"]
			}).id],
			addObservationKeys: ["z"],
			executionRequested: false
		}
	});
	let blocked = false;
	let note = "";
	try {
		admit(candidate, "model-A");
		note = "self-review unexpectedly succeeded";
	} catch (e) {
		blocked = /self-review/i.test(e instanceof Error ? e.message : String(e));
		note = e instanceof Error ? e.message : String(e);
	}
	return {
		id: "self_review",
		title: "No self-review",
		body: "The proposer cannot admit its own candidate. Local projection is not Hodgeform Core approval.",
		beforeAdequate: null,
		afterAdequate: null,
		ledgerMutated: false,
		coreLanguageLimit: false,
		coreAdmission: false,
		selfReviewBlocked: blocked,
		candidateHash: candidate.candidateHash,
		notes: [note]
	};
}
//#endregion
export { runFlmDemo as n, demo_server_exports as t };
