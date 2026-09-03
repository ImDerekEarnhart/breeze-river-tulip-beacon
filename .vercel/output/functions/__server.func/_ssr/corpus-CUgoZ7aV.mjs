//#region node_modules/.nitro/vite/services/ssr/assets/corpus-CUgoZ7aV.js
var CORPUS = [
	{
		id: "doc-layers",
		title: "Orbita is an agent system, not a model",
		tags: [
			"architecture",
			"orchestrator",
			"vllm"
		],
		text: `The cleanest version of Orbita is not one giant model on one VM. The VM hosts an agent system with separate inference, retrieval, governance, and execution layers. LLM/SLM is the actual model. vLLM is software for running and serving the model — not the student. The teacher is a stronger model used for difficult reasoning, supervision, and creating training data, only via explicit escalation. The language tower is the current executable language L_t — semantic substrate, not a chatbot, not RAG. In this preview, retrieval is lexical BM25 over a corpus; that is not the Tower VM. Orbita/HodgeForm is the epistemic governor. The agent is the software loop connecting all of them. vLLM exposes an OpenAI-compatible HTTP interface, structured outputs, and tool calling, so it sits behind the agent controller rather than containing the agent.`
	},
	{
		id: "doc-two-models",
		title: "Teacher and student routing",
		tags: [
			"teacher",
			"student",
			"routing",
			"cost"
		],
		text: `Orbita uses two models. The student or worker is a 3B–14B-class open model served locally through vLLM. It classifies requests, retrieves context, extracts structured data, decides ordinary tool calls, summarizes tool outputs, and handles simple coding. The teacher is a large high-quality LLM, initially API-based. The teacher is an explicit escalation — verification failed, student requested, low confidence, parse failure, or a governed plan — never a silent fallback for a missing student. This drastically reduces inference expense. Later, the teacher's successful outputs become data for improving the student. Never put the agent loop inside vLLM — the controller treats vLLM as POST /v1/chat/completions, just like another model provider. Claude/LLM/Codex is an explorer and builder, never the authority that decides its own changes are correct.`
	},
	{
		id: "doc-roles",
		title: "Retrieval is not the Language Tower",
		tags: [
			"architecture",
			"retrieval",
			"tower",
			"routing"
		],
		text: `Do not redefine Language Tower as embedding plus retrieval plus reranking. Retrieval feeds context to the student. Language Tower / L_t is what the governed system can represent, express, and distinguish. Student = worker model. vLLM = serving infrastructure. Teacher = explicit escalation and proposal. Orbita/HodgeForm = governor of claims, experiments, and changes. Frozen falsifiers: if Tower interfaces are only search/rerank, the L_t reading is refuted for this app; if a missing student silently invokes the teacher, fail-closed is refuted; if a repair can promote itself, governance failed; if a tool call gets an unrestricted host shell, execution failed.`
	},
	{
		id: "doc-language-tower",
		title: "Language tower: executable L_t, not the prompt",
		tags: [
			"retrieval",
			"rag",
			"embeddings",
			"rerank",
			"tower"
		],
		text: `The Language Tower is the current executable language L_t. Meaning counts as grounded when it compiles to an executable operation over an explicit world. Grounding is typed: STRUCTURALLY_GROUNDED, IDENTITY_ONLY, HUMAN_CONVENTION, EXTERNALLY_SUPPLIED, UNRESOLVED, REFUTED. Unknown is not false. Assertion is not truth. Retrieval is a separate subsystem. In this control plane, retrieval is lexical BM25-style over the governed corpus plus a rerank by title and tag overlap. That BM25 layer is not the Tower VM, does not issue LANGUAGE_LIMIT certificates, and cannot promote a language version.`
	},
	{
		id: "doc-tower-manifesto",
		title: "Language Tower superintelligence manifesto",
		tags: [
			"tower",
			"manifesto",
			"governance",
			"orbl",
			"superintelligence"
		],
		text: `Do not interpret superintelligence as permission to make the system more autonomous without governance. The target is a system whose representational and reasoning capacity expands only through explicit, executable, falsifiable, hash-bound, reviewable changes. Self-improvement is not self-editing. Self-improvement is evidence-gated language repair. Architecture: Orbita (epistemic governor) → Language Tower (current executable L_t) → representation auditor (collision, symmetry, nuisance) → language diagnosis (SEARCH_FAILURE vs LANGUAGE_LIMIT) → repair specification → prospective testing → ORB-L admission → L_t+1. The Tower may propose a version. It may not promote its own version. Stage I superhuman autonomous discovery is not claimed. Origin is not evidence. A system-synthesized primitive is not automatically EARNED.`
	},
	{
		id: "doc-fiber-collision",
		title: "Fiber collision: exact finite detection of representational insufficiency",
		tags: [
			"fiber",
			"representation",
			"hole",
			"auditor",
			"factorization"
		],
		text: `For a representation pi:X->P and target O:X->Q on a finite set X, an exact decoder exists iff O is constant on every fiber of pi. A collision witness is a pair with the same pi and different O; that certifies HOLE. NO_HOLE requires checking every fiber. Recovery uses supplied candidate channels; only independent candidates may count as new information. pi-derived channels repackage the original representation. Target-derived channels leak the answer. A minimal recovery is a minimum-cardinality admissible subset that makes O constant on refined fibers. This is finite factorization, not a new quotient theorem, not LANGUAGE_LIMIT, and not Opaque Fiber Stress Benchmark v1.0.1. The local Guided suite is a designer-supplied control. SEARCH_FAILURE is a finite miss; LANGUAGE_LIMIT is a theorem on a frozen grammar. Exhausted table search is not a theorem.`
	},
	{
		id: "doc-flm",
		title: "Fiber Lattice Machine: finite kernel, not Core",
		tags: [
			"flm",
			"representation",
			"refine",
			"quotient",
			"admission"
		],
		text: `The Fiber Lattice Machine is a non-activating finite kernel. The raw world ledger is immutable. Representation snapshots are views. REFINE adds a visible key to break a certified target-relevant fiber collision. QUOTIENT removes a nuisance distinction from a view and never deletes the raw fact. OBSERVE proposes an allowed observation channel and never executes it. MERGE unions visible keys; v0 makes no lattice-completeness claim. createCandidateDelta does not mutate the registry. A candidate enters only through an admission record bound to the exact candidate hash. The proposer cannot self-review. Local projection is not Hodgeform Core approval. Adequacy is exact finite-world fiber constancy, not LANGUAGE_LIMIT and not Stage I.`
	},
	{
		id: "doc-orbita",
		title: "Orbita / HodgeForm as scientific governor",
		tags: [
			"orbita",
			"hodgeform",
			"governance",
			"plan"
		],
		text: `Ordinary agent thoughts should not all run through Orbita. Fast agent loop: User → Retrieve → SLM → Tool call → Verify → Answer, in milliseconds to seconds. Governed reasoning loop is for research, experimentation, model improvement, or claims that matter: Question → Orbita case → case context → teacher proposes analysis plan → submit/compile plan → frozen plan + SHA-256 → approval → run discovery → candidate result → freeze experiment → sandbox execution → independent evaluation → record governed result. That creates an immutable boundary between "the AI proposed something" and "we actually tested that thing." Orbita remains the authority for frozen plans, claims, contradictions, supersession, approval, promotion, and rollback.`
	},
	{
		id: "doc-orbita-primitives",
		title: "Orbita interface primitives",
		tags: [
			"orbita",
			"api",
			"plan",
			"hash"
		],
		text: `The Orbita/HodgeForm interface exposes: orbita_case_context, orbita_compile_plan or orbita_submit_plan, orbita_get_plan, orbita_approve_plan, orbita_run_discovery, orbita_freeze_external_experiment, orbita_get_governed_improvement, orbita_record_governed_improvement_evaluation. Language adapters on Core include orbita_build_language_snapshot, orbita_build_language_limit_certificate, orbita_build_language_repair_candidate, orbita_build_capability_component_graph, orbita_list_case_language_limits. A frozen plan is hashed with SHA-256. After freeze, the plan text is immutable. Discovery must execute the frozen plan, not a later rewritten one. Evaluation is independent of the proposing model. Guided lists these names as a contract. It does not invent Core scientific behavior.`
	},
	{
		id: "doc-improvement-loop",
		title: "Teacher/student improvement loop",
		tags: [
			"training",
			"lora",
			"distillation",
			"traces"
		],
		text: `The killer feature is a teacher/student improvement loop. When the SLM fails a task: verifier says FAIL → teacher solves it → Orbita creates a bounded evaluation → teacher solution is tested → store prompt, retrieval context, student attempt, teacher answer, tool trace, verification result, Orbita plan hash, and experiment result. After enough records, production traffic hits the student; failures go to the teacher, then Orbita verification, then the training DB, then LoRA / fine-tune, then an improved student. vLLM can serve LoRA adapters over a base model so specialized students (research, coding, finance, data-analysis) do not require separate foundation models. The worker is never allowed to arbitrarily rewrite itself.`
	},
	{
		id: "doc-sandbox",
		title: "Keep execution outside the model process",
		tags: [
			"sandbox",
			"tools",
			"policy",
			"security"
		],
		text: `Never give the LLM unrestricted Linux shell access. The model emits a structured action such as { "tool": "python", "arguments": {...} }. An agent policy engine validates the tool name and schema, then an isolated worker or container executes it and returns a result. Allowed tools are an explicit set: sandbox/python, search/retrieve, read-only database, Orbita client. Ephemeral workers are preferred: controller → job queue → temporary container → execute → capture artifact → destroy. Not LLM → sudo bash. The execution layer reports what ran. Orbita decides what the result means.`
	},
	{
		id: "doc-memory",
		title: "Explicit agent memory, not just the prompt",
		tags: [
			"memory",
			"postgres",
			"vector",
			"state"
		],
		text: `Do not put all memory into prompts. Working memory is the current conversation or task. Semantic memory is embeddings and knowledge. Episodic memory is previous agent runs. Procedural memory is tools, skills, and instructions. Experimental memory is Orbita plans and results. Training memory is teacher/student traces. Storage: Postgres for users, sessions, runs, messages, tool_calls, evaluations, model_versions, experiment_refs. Vector DB for documents, memories, successful traces. Object storage for datasets, source files, generated artifacts, and checkpoints.`
	},
	{
		id: "doc-agent-loop",
		title: "The fast agent loop",
		tags: [
			"loop",
			"verify",
			"tools"
		],
		text: `The actual agent loop stays small: 1. Understand and retrieve via the language tower. 2. Decide which model should handle it. 3. Ask the model for a structured action with tool schemas. 4. Execute tools while the model keeps calling them. 5. Verify the answer against the request. 6. Escalate difficult failures to the teacher. If the request requires governed research, create or load an Orbita case, have the teacher propose a plan from case context, freeze the plan, review/approve, then run discovery.`
	},
	{
		id: "doc-build-order",
		title: "Recommended build order",
		tags: [
			"mvp",
			"phases",
			"vllm"
		],
		text: `Do not start with model training. Phase 1: Linux GPU VM + vLLM student + FastAPI orchestrator + 5–10 controlled tools, until one agent reliably executes structured tasks. Phase 2: language snapshot, representation audit (fiber collision), then embedding/pgvector/reranker. Phase 3: teacher routing and trace collection. Phase 4: Orbita/HodgeForm frozen plan, controlled experiment, evaluation, ORB-L admission. Phase 5: learning loop — production failures → teacher correction → Orbita falsification/eval → validated dataset → LoRA / distillation → new student → A/B evaluation. Kubernetes is not required for the MVP. No language version promotes itself.`
	},
	{
		id: "doc-hodgeform",
		title: "HodgeForm and falsifiable evaluation",
		tags: [
			"hodgeform",
			"science",
			"evaluation"
		],
		text: `HodgeForm is the mathematical and experimental posture behind Orbita: claims are treated as forms that must be frozen before they are tested. A proposal is not a result. A result is not governed until an independent evaluation has run against a hashed plan. Falsification is first-class: an experiment that fails its success criteria is a valid governed record, and is often more useful for student training than a vague success. This is what ordinary agents lack — they rewrite the plan while executing it, so you cannot tell whether the idea worked.`
	},
	{
		id: "doc-compound",
		title: "Compound growth formula",
		tags: [
			"math",
			"finance",
			"sandbox"
		],
		text: `Future value with compound interest is FV = PV * (1 + r)^n where PV is present value, r is the rate per period as a decimal, and n is the number of periods. Example: $10,000 at 7% for 12 years is 10000 * (1.07 ** 12). Use the sandbox for the numeric evaluation rather than estimating. Annual compounding is assumed unless stated otherwise.`
	},
	{
		id: "doc-vllm",
		title: "vLLM serving notes",
		tags: [
			"vllm",
			"inference",
			"lora"
		],
		text: `vLLM currently exposes an OpenAI-compatible HTTP interface, structured outputs, and tool calling. Structured output is particularly useful because the agent can require JSON schemas rather than parsing arbitrary model prose. vLLM also supports serving LoRA adapters, including different adapters over one base model. The controller should call it with an OpenAI client pointed at the student base URL /v1. In this preview the student is configured only when STUDENT_BASE_URL is set. xAI grok-4.5 may be the teacher or a Grok-alone condition, never a silent stand-in for the GPU student.`
	},
	{
		id: "doc-services",
		title: "MVP service layout on one GPU VM",
		tags: [
			"infra",
			"docker",
			"postgres"
		],
		text: `MVP host: Ubuntu 24.04, NVIDIA GPU, Docker, NVIDIA Container Toolkit. Services: FastAPI agent/controller, vLLM SLM inference, Postgres for agent state, pgvector or Qdrant for semantic memory, Redis for queues and cache, MinIO/S3 for artifacts, Orbita/HodgeForm for governed analysis, Docker sandbox workers. Data directories: postgres, vector-store, object-store, logs. Separate machines later; Kubernetes is optional after the loop works.`
	},
	{
		id: "doc-pocketdesktop",
		title: "PocketDesktop: a desktop target, not a root shell",
		tags: [
			"desktop",
			"pocketdesktop",
			"novnc",
			"tailscale",
			"xfce"
		],
		text: `PocketDesktop Linux v0.1.0 gives Orbita a private Ubuntu 24.04 XFCE desktop alongside PocketDroid. Default VM: project pocketdroid, name pocketdesktop, zone us-east4-b, machine e2-standard-2, 35 GB balanced disk. Stack: Xvfb 1440×900, XFCE, x11vnc on localhost:5900, noVNC/websockify on 127.0.0.1:6080, Tailscale-only HTTPS serve, Chromium autostart, 20-minute idle auto-shutdown. The agent must not get unrestricted root. The narrow API is screenshot, mouse click, keyboard type, and approved app launches (chromium, files, terminal, calculator), with every action logged. sudo, ssh, rm -rf, and shutdown are policy-denied. Operator VM controls (start/stop/status) live outside the model process.`
	},
	{
		id: "doc-receipts",
		title: "Evidence-carrying receipts on the fast path",
		tags: [
			"receipts",
			"evidence",
			"loop",
			"hash"
		],
		text: `Guided receipts are an interchange, not a second scientific engine. Schema guided-receipt/1. Kinds: context, proposal, execution, verification, admission, control. A SHA-256 hash binds the canonical body excluding the hash field. parentReceiptIds form an evidence chain. Retrieve emits a context receipt over BM25. Tools emit execution receipts without changing tool semantics. Verify emits a verification receipt parented to the most recent prior receipt. Hodgeform Core remains the Control plane. These hashes do not replace Core event or artifact hashes, do not freeze plans, and do not approve anything.`
	},
	{
		id: "doc-orb1",
		title: "ORB-1: Q(i) coefficient ring, not a language theorem",
		tags: [
			"orb1",
			"gaussian",
			"admission",
			"quarantine"
		],
		text: `ORB-1 is a local exact-arithmetic control on Gaussian rationals Q(i) over the frequency group Z^d. Coordinate derivations D_j and translations T_u with phasors on the Q(i) unit circle (a²+b²=1 in Q) are admitted here. physical_derivative_sqrt2 needs i√2 n and is quarantined. shift_pi_over_4 needs (1+i)/√2 and is quarantined. Those are coefficient-ring limits of Q(i), not Hodgeform Core LANGUAGE_LIMIT certificates, and they are never EARNED. 16-bit paging overflow is a labeled simulation, not a register machine and not the Tower VM. Origin is not evidence.`
	}
];
//#endregion
export { CORPUS as t };
