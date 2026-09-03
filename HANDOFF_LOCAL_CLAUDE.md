# Handoff for local Claude

**Status in this workspace (2026-08-22):** Slice 1 is in-tree (`src/lib/agent/education/`). `ARCHITECTURE_LOOP.state` is `RETRY`. The RETRY artifact is on disk and **not submitted**. Slice 2 remains blocked (no student GPU, no tenant OAuth). Do not re-implement the education layer from scratch — verify hashes, then only do Slice 2 if `.env` is actually live.

Paste the **Prompt** block into local Claude. Give it this repo (exclude `node_modules`).
Do not treat Grok chat Hodgeform as the app being connected.


---

## Prompt (paste this)

You are local Claude on the operator's machine. You have a shell, filesystem, and (if present) GPU + Hodgeform credentials. You are **not** Grok Build in a sandbox. You may write `.env` locally. Never commit secrets. Never invent Core receipts.

### What this repo is

Hodgeform **Guided** — TanStack Start / React / Tailwind v4 preview of a governed agent.

Frozen ontology from HodgeForm case `case_c79bed8f9bd34612` / loop `problem_loop_541ce2f1fac54e92`:

- **Student** = local worker model behind vLLM (OpenAI-compatible). Grok is never the student.
- **vLLM** = serving infrastructure, not a role.
- **Teacher** = explicit escalation / proposer. Never a silent fallback.
- **Retrieval** = BM25 + rerank. Not Language Tower.
- **Language Tower** = governed executable language `L_t`. This repo's tower is a **local fiber auditor** (`not_the_tower_vm=true`, no write ops, `promotion_enabled=false`). Do not fake a Tower VM.
- **Orbita / Hodgeform Core** = freeze / falsify / govern. Sole scientific engine. This repo does **not** contain Core.
- **Sandbox** = isolated Python. **Verifier** = outcome check. Fast-path verifier is currently shallow.

Composition: Candidate B infrastructure + Candidate A ontology + HodgeForm change boundary.

### Hard rules

1. Do not overwrite `src/lib/agent/hodgeform/` blindly. Adapters were inspected; hashes matched.
2. Do not import `optional/*` onto the fast path. ARC / HA-IR / ORB-1 Python / spectral plugins stay quarantined.
3. Fast path must fail-closed if `STUDENT_BASE_URL` / student health is missing. Never substitute the teacher.
4. Teacher-derived improvements stay inert. No self-promotion. `coreApproved` stays false unless Core actually approved.
5. Local `guided-receipt/1` is interchange, not Core approval.
6. Auth OFF. Persistence is local (`guided-world/1` + lab store). Chat and world persist together. There is **no** Clear chat / New topic. Cap conversation at 200 turns (window, not a reset).
7. Do not call chat-side Hodgeform from this machine and then stamp those hashes as app-MCP proof. App proof requires **tenant-bound server OAuth** in env (`HODGEFORM_MCP_ACCESS_TOKEN` or client credentials). Browser tokens and `VITE_` keys are refused.
8. Do not issue `LANGUAGE_LIMIT` from a local NLP miss. Core diagnosis of the current hole is **VERIFIER_LIMIT**, certificate hash null.
9. Do not patch production. This is a preview. Activation remains false.

### Live Core snapshot (operator-chat channel, 2026-08-22)

These IDs are real. They are **not** from the Guided app MCP.

- Case: `case_c79bed8f9bd34612` (plan_ready) — Agent architecture: student/teacher/Language Tower/Orbita boundary
- Loop: `problem_loop_541ce2f1fac54e92`
- **Current state: RETRY** (local file `ARCHITECTURE_LOOP.state` still says `ACT` — stale, fix it)
- `latest_event_hash`: `5c339c5dbc74b6c01900a0aafef4db0f7e7422cc42e3f4a123b60b1df12d5c23`
- `retry_authorized`: true
- Next required artifact keys: `change_summary`, `retained_falsifiers`, `retry_authorized`
- Diagnosis: `limitation_kind: VERIFIER_LIMIT` — shallow fast-path verifier (presence / length / confidence / permissive numeric). Cannot score English/NLP or independently admit teacher corrections.
- Repair candidate (inert): `repair_kind: verifier`, hash `53f3b10fb903f3330152deefa2d885882ec4397252ad75145f8b88a3529c7449`, `activation_requested: false`
- Prospective predictions Core froze:
  - Teacher corrections stay quarantined until an independent verifier passes the teacher answer
  - Student-only English smoke exam fail-closes when student is absent; never substitutes teacher
  - Exact semantic-label scoring detects missing answers and high-confidence wrong answers
  - An NLP miss cannot issue LANGUAGE_LIMIT from the local education layer
  - Existing retrieval/Tower and student/teacher role-separation tests remain green
- Known risks Core froze: starter English suite is operator-visible smoke, not sealed held-out; competency tagging is heuristic; no live student GPU was in the Grok sandbox; multilingual invariance and real Tower VM remain future work

Other loops (do not reopen unless asked):

- `problem_loop_ba9bbe0255ab47e4` FLM kernel — COMPLETED
- `problem_loop_01e20a5d8f6546f1` FLM scale / lattice term — COMPLETED; architecture **downgraded to representation DAG / partition-semilattice**, not a true lattice
- `problem_loop_24ebf432d8364280` Canonical Partition Index + Target Frontier Index — COMPLETED, `verify` valid
- `problem_loop_d7ec0590d4c14576` SYNTHETIC Guided freeze — REPRESENT only. Hash-valid, **not** a Core proof
- `problem_loop_3579c46c99934e74` equal-budget protocol freeze — REPRESENT only. Do not score missing providers

Executors available in Core: `tabular-statistical/1`, `prospective-blind-calibration/1`, `structured-research-operator/1`. Unavailable kinds: `formal_theorem`, `graph_candidate`, `language_primitive`, `execution_adapter`. No activation authority.

### Slice 1 — implement the Core-named verifier repair (do this first)

Add a **local education verifier**, separate from the shallow fast-path check. Do not replace every task verifier. Do not activate Core.

Suggested shape (adapt to existing code, do not gold-plate):

- `src/lib/agent/education/` (or similar) with:
  - frozen smoke items: exact expected labels / short answers
  - `score(answer, expected)` deterministic
  - fail on missing answer, high-confidence wrong label
  - never emit LANGUAGE_LIMIT
- Wire teacher-correction quarantine: a training record stays `quarantined` until this verifier passes the **teacher** answer. Student fail still does not auto-admit.
- Student-only exam runner: if student unconfigured → fail-closed, no teacher substitution.
- Tests in `scripts/` with `node --test`. Keep `scripts/architecture-roles.test.mjs` green.
- Update `ARCHITECTURE_LOOP.state` to `"RETRY"` and note `candidate_hash`.
- UI: one honest line on Architecture or Memory that this is a **local smoke exam**, not Core, not a held-out benchmark.

Do **not** treat Core candidate hash `53f3b10f…` as the hash of your new files unless you recompute and it matches. Record your own SHA-256 of the new module.

### Slice 2 — only if env is actually live

Read `.env.example`. Required for scientific path:

```
STUDENT_BASE_URL
STUDENT_MODEL_ID
STUDENT_HEALTH_URL
```

plus either `HODGEFORM_MCP_ACCESS_TOKEN` or client-credentials (`HODGEFORM_CLIENT_ID`, `HODGEFORM_CLIENT_SECRET`, `HODGEFORM_TOKEN_URL`).

If **any** of those are missing, **stop and report blocked**. Do not mock them.

If they are live, in order:

1. Health: student `/health` (or `STUDENT_HEALTH_URL`) and Hodgeform UI health.
2. MCP tools list through the **app** server client (`src/lib/agent/hodgeform/mcp.server.ts`), not a browser token.
3. One synthetic case + one freeze/verify. Reuse existing `CORE_PROOF` / `core-proof.ts` path. Do not approve research plans.
4. Only then equal-budget: Grok-alone vs student-alone vs Grok/student + Hodgeform. Shared `max_output_tokens=500`, `timeout_seconds=45`, `n_tasks=3`. Missing provider = blocked, not scored. Receipts must be Core hashes.

Loop `problem_loop_3579c46c99934e74` already froze that protocol in Core at REPRESENT. Advance only with real app-MCP events.

### Slice 3 — optional Core loop advance

If you have Hodgeform MCP **as the app** (server OAuth), you may submit the RETRY artifact to `problem_loop_541ce2f1fac54e92` with `expected_state=RETRY` and `expected_previous_event_hash=5c339c5dbc74b6c01900a0aafef4db0f7e7422cc42e3f4a123b60b1df12d5c23`. If you only have chat-plugin Hodgeform, **do not** advance the loop and claim Guided did it.

### How to run

```bash
npm install
npm run typecheck
node --experimental-strip-types --test scripts/*.test.mjs
# app
npm run dev   # 0.0.0.0:8080
```

Python optional plugins under `optional/` stay quarantined even if pytest passes.

### File map

| Path | Role |
|---|---|
| `src/lib/agent/roles.ts` | Frozen ontology, routing, falsifiers. Update loop state. |
| `src/lib/agent/orchestrator.server.ts` | Fast / governed run. Wire verifier + fail-closed. |
| `src/lib/agent/providers/` | Student / teacher. Fail-closed config. |
| `src/lib/agent/hodgeform/` | MCP + OAuth. Inspect, do not overwrite. |
| `src/lib/agent/receipts.ts` | `guided-receipt/1` interchange. |
| `src/lib/agent/tower/` + `flm/` + `orb1/` | Local controls. Not Core. |
| `src/lib/agent/handoff.ts` | Overlay vs adapters vs optional. |
| `src/lib/world.ts` + `world-store.ts` + `store.ts` | Persisted world + conversation. |
| `optional/` | Quarantined. |
| `scripts/architecture-roles.test.mjs` | Must stay green. |
| `.env.example` | Env contract. Copy to `.env` locally. |

### Done looks like

- Education verifier exists, tested, fail-closed without student
- Teacher answers quarantined until verifier pass
- No LANGUAGE_LIMIT from local NLP
- `ARCHITECTURE_LOOP.state === "RETRY"`
- Role-separation tests still pass
- If GPU+OAuth present: real tools list + one synthetic Core verify
- Short report back: what shipped, hashes of new files, what is still blocked

---

## Operator checklist (you)

1. Copy this repo to the machine that has local Claude. Skip `node_modules`.
2. If you have a student GPU: fill `STUDENT_BASE_URL`, `STUDENT_MODEL_ID`, `STUDENT_HEALTH_URL` in local `.env`.
3. If you have Hodgeform tenant credentials: fill server OAuth fields in `.env`. Not a browser cookie.
4. Paste the Prompt into Claude with the repo as context.
5. Bring the report back here if you want Grok to continue.
