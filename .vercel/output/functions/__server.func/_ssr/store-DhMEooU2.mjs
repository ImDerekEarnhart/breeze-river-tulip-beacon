import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as useDesktop } from "./desktop-store-DSEsB1fI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-DhMEooU2.js
var ARCHIVED_EXPERIMENTS = [{
	caseId: "case-a1b0c2d3",
	question: "Does a reranker after BM25 improve precision@5 for agent memory?",
	plan: `Hypothesis: title/tag-aware rerank of the top 12 BM25 hits raises precision@5 on architecture queries versus BM25 alone.
Method: freeze a 12-query gold set covering teacher routing, sandbox policy, HodgeForm, vLLM, and memory kinds. Run BM25-only vs BM25+rerank. Score precision@5 against gold ids.
Success: +0.10 precision@5 without dropping recall@5 more than 0.05.
Falsification: rerank precision@5 <= BM25 or recall drop > 0.05.
Sandbox: compute precision tables only; no model weights change.`,
	planHash: "a1b0c2d3e4f5061728394a5b6c7d8e9f00112233445566778899aabbccddeeff",
	status: "evaluated",
	discovery: "BM25 P@5 = 0.62. BM25+rerank P@5 = 0.78. Recall@5 unchanged at 0.84. Gold set n=12.",
	evaluation: {
		pass: true,
		notes: "Success criterion met. Frozen plan hash matches execution log. Promote rerank into the language tower."
	},
	createdAt: 17556e8
}, {
	caseId: "case-9f21aa07",
	question: "Does the student emit valid tool JSON more often with schema-constrained decoding?",
	plan: `Hypothesis: forcing JSON schema on the student reduces tool-call parse failures versus free prose.
Method: 40 held-out tasks requiring one sandbox or retrieve call. Compare unconstrained vs json_object decoding.
Success: parse-failure rate < 5% and no increase in wrong-tool rate.
Falsification: parse failures stay >= 12% or wrong-tool rate rises.`,
	planHash: "9f21aa0700112233445566778899aabbccddeeff00112233445566778899aabb",
	status: "evaluated",
	discovery: "Unconstrained parse fail 18%. Schema-constrained parse fail 2.5%. Wrong-tool 6% vs 5%.",
	evaluation: {
		pass: true,
		notes: "Keep structured outputs on the worker. Record as a training prior for LoRA later."
	},
	createdAt: 175542e7
}];
var seedMemories = [
	{
		id: "sem-tower",
		kind: "semantic",
		title: "Language tower",
		body: "Current executable L_t — not retrieval. This preview's BM25 layer is a separate retrieval subsystem. Fiber collision is a local exact control. Orbita governs promotion.",
		createdAt: 0
	},
	{
		id: "proc-tools",
		kind: "procedural",
		title: "Allowed tools",
		body: "sandbox, retrieve, memory_read, memory_write, orbita_status, fiber_diagnose, orb1_admit, flm_audit, desktop. Desktop is screenshot/click/type/launch only — never root. orb1_admit is a local Q(i) ring gate. flm_audit is a local FLM kernel, not Core.",
		createdAt: 0
	},
	{
		id: "exp-rerank",
		kind: "experimental",
		title: "Rerank P@5",
		body: "Archived governed result: BM25+rerank P@5 0.78 vs 0.62. Hash a1b0c2d3…",
		createdAt: 0
	}
];
var useLab = create()(persist((set) => ({
	mode: "fast",
	turns: [],
	runs: [],
	experiments: ARCHIVED_EXPERIMENTS,
	traces: [{
		id: "tr-seed-1",
		prompt: "When should the worker escalate?",
		studentAttempt: "Always call the teacher for any architecture question.",
		teacherAnswer: "Escalate only if confidence < 0.55, verification fails, or a governed plan is required. Ordinary retrieval stays on the student. A missing student does not become the teacher.",
		verification: "fail",
		createdAt: 0
	}],
	memories: seedMemories,
	activeRunId: null,
	replayIndex: 0,
	setMode: (mode) => set({ mode }),
	setReplayIndex: (replayIndex) => set({ replayIndex }),
	setActiveRun: (activeRunId) => set({
		activeRunId,
		replayIndex: 0
	}),
	addUserTurn: (content) => {
		const id = crypto.randomUUID();
		set((s) => ({ turns: [...s.turns, {
			id,
			role: "user",
			content
		}] }));
		return id;
	},
	completeRun: (userTurnId, run) => set((s) => {
		const memories = [...s.memories];
		memories.unshift({
			id: `epi-${run.id.slice(0, 8)}`,
			kind: "episodic",
			title: run.request.slice(0, 72),
			body: run.answer.slice(0, 280),
			createdAt: run.createdAt
		});
		if (run.training) memories.unshift({
			id: `train-${run.training.id}`,
			kind: "training",
			title: "Teacher correction",
			body: run.training.teacherAnswer.slice(0, 240),
			createdAt: run.training.createdAt
		});
		if (run.orbita) memories.unshift({
			id: `exp-${run.orbita.caseId}`,
			kind: "experimental",
			title: run.orbita.caseId,
			body: `hash ${run.orbita.planHash.slice(0, 12)} · ${run.orbita.status}`,
			createdAt: run.orbita.createdAt
		});
		if (run.desktop) {
			useDesktop.getState().hydrate(run.desktop);
			memories.unshift({
				id: `desk-${run.id.slice(0, 8)}`,
				kind: "episodic",
				title: "PocketDesktop",
				body: `status ${run.desktop.status} · focused ${run.desktop.focused || "none"}`,
				createdAt: run.createdAt
			});
		}
		return {
			turns: [...s.turns, {
				id: `a-${run.id}`,
				role: "assistant",
				content: run.answer,
				runId: run.id
			}],
			runs: [run, ...s.runs].slice(0, 40),
			traces: run.training ? [run.training, ...s.traces].slice(0, 40) : s.traces,
			experiments: run.orbita ? [run.orbita, ...s.experiments.filter((e) => e.caseId !== run.orbita?.caseId)].slice(0, 30) : s.experiments,
			memories: memories.slice(0, 80),
			activeRunId: run.id,
			replayIndex: 0
		};
	}),
	failUserTurn: (userTurnId, message) => set((s) => ({ turns: [...s.turns, {
		id: `err-${userTurnId}`,
		role: "assistant",
		content: message
	}] })),
	approveExperiment: (caseId) => set((s) => ({ experiments: s.experiments.map((e) => e.caseId === caseId && e.status === "frozen" ? {
		...e,
		status: "approved"
	} : e) })),
	remember: (item) => set((s) => ({ memories: [item, ...s.memories].slice(0, 80) })),
	clearSession: () => set({
		turns: [],
		activeRunId: null,
		replayIndex: 0
	})
}), { name: "orbita-lab-v2" }));
//#endregion
export { useLab as t };
