# THE LANGUAGE TOWER SUPERINTELLIGENCE MANIFESTO
## Governed Self-Extending Meaning, Representation Repair, and Falsification-First Intelligence

**Audience:** Claude Code working directly on the Language Tower repository  
**Status:** product and architecture directive  
**Primary goal:** evolve the Language Tower from a rigorously grounded executable language system into a **governed self-extending reasoning architecture** that can detect its own representational failures, prove when its current language is structurally insufficient, propose minimal repairs, prospectively test those repairs, and admit only changes that survive falsification.

---

# 0. FIRST PRINCIPLE

Do **not** interpret “superintelligence” here as permission to make the system more autonomous, fluent, or self-modifying without governance.

The target is not:

> a model that can rewrite itself.

The target is:

> **a system whose representational and reasoning capacity can expand only through explicit, executable, falsifiable, hash-bound, reviewable changes.**

The governing principle is:

> **Self-improvement is not self-editing. Self-improvement is evidence-gated language repair.**

The Language Tower already embodies the right instinct: meaning is executable, claims are checkable, unknown is distinct from false, assertions are not world facts, refutations persist, skipped tests are not passing tests, and an apparently obvious claim can be rejected by a witness.

Preserve that discipline. Make it recursive.

---

# 1. THE CORE ARCHITECTURE

The correct architecture is not:

```text
Orbita
├── Language Tower
└── Unaskable Questions
```

It is:

```text
                         ORBITA
                  epistemic governor
                         │
                         ▼
                  LANGUAGE TOWER
              current executable L_t
                         │
             ┌───────────┴───────────┐
             │                       │
      ordinary reasoning      meta-reasoning
                                     │
                                     ▼
                          REPRESENTATION AUDITOR
                                     │
                         ┌───────────┼───────────┐
                         │           │           │
                   collision     symmetry     nuisance
                    search        search        search
                         │           │           │
                         └───────────┼───────────┘
                                     ▼
                              LANGUAGE DIAGNOSIS
                         ┌───────────┴───────────┐
                         │                       │
                  SEARCH_FAILURE          LANGUAGE_LIMIT
                                                 │
                                                 ▼
                                     REPAIR SPECIFICATION
                                                 │
                                                 ▼
                                       REPAIR SYNTHESIS
                                                 │
                                                 ▼
                                      PROSPECTIVE TESTING
                                                 │
                                                 ▼
                                         ORB-L ADMISSION
                                                 │
                                         governed approval
                                                 │
                                                 ▼
                                               L_t+1
```

The Language Tower is the **semantic substrate**.

The Unaskable Questions framework is the Tower's **metacognitive audit-and-repair loop**.

ORB-L is the **provenance and admission schema** governing changes to the Tower.

Orbita is the **epistemic governor** deciding which frozen evidence changes the durable knowledge state.

The Discovery Genome is the **meta-learning layer** that stores reusable methods for discovering and falsifying across domains.

DerekX or an equivalent deterministic runner is the **execution authority** for arbitrary frozen experiments.

Claude/LLM/Codex is an **explorer and builder**, never the authority that decides its own changes are correct.

---

# 2. WHAT THE LANGUAGE TOWER ALREADY IS

Do not throw away the architecture that produced the current Tower.

Its important properties are foundational.

## 2.1 Meaning is executable

A word does not count as grounded because it has a gloss.

It counts as grounded when its meaning compiles to an executable operation over an explicit world or state representation.

## 2.2 Grounding is typed and non-uniform

The system must distinguish at least:

```text
STRUCTURALLY_GROUNDED
IDENTITY_ONLY
HUMAN_CONVENTION
EXTERNALLY_SUPPLIED
UNRESOLVED
REFUTED
```

Examples:
- spatial relations can be structurally grounded;
- Boolean logic can be structurally grounded;
- color labels may be identity-only if no internal quality geometry exists;
- “tension” as a name for a numerical target can remain a human convention even when the structural mapping is proven.

Never manufacture hidden structure merely to dissolve a refusal.

## 2.3 Unknown is not false

A blank store must mean `UNKNOWN`, not `FALSE`.

Truth must remain at least three-valued where appropriate:

```text
TRUE
FALSE
UNKNOWN
```

and time-indexed where the world model requires it.

## 2.4 Assertion is not truth

Maintain separate stores for:

```text
WORLD_FACT
BELIEF
ASSERTION
DERIVED_KNOWLEDGE
```

Testimony must not mutate the world state.

Knowledge should be derived from truth plus belief or other explicit rules; it should not be a mutable bit that can be set independently of its grounds.

## 2.5 Read and write semantics must remain separate

A report must not re-enter the language as an action that makes itself true.

Every user-facing or machine-generated utterance must be auditable for:

```text
READ
WRITE
QUERY
ASSERT
TRANSFORM
NO_OP
```

A response to a read-only query may not compile into a write if replayed.

## 2.6 Refutations are permanent assets

Do not delete failed claims.

Record:

```text
claim
witness
why it failed
what superseded it
which later claims depend on the correction
```

A system that reports only successes has not been examined hard enough.

---

# 3. THE NEW THESIS: INTELLIGENCE IS REPRESENTATION MANAGEMENT

The next stage should not be “add more words.”

The next stage is:

> **detect when the current language partitions reality incorrectly for the task.**

A language can fail in two dual ways.

---

# 4. FAILURE TYPE A — REPRESENTATION TOO COARSE

Let the current executable language be \(L\).

Define:

\[
x \sim_L y
\iff
\forall Q\in L,\ Q(x)=Q(y).
\]

The language has a **coarse representational hole** for target \(O\) when:

\[
x\sim_L y
\quad\land\quad
O(x)\neq O(y).
\]

Meaning:

> the language merges states the target requires us to distinguish.

Examples already motivating the architecture:
- cellular-automaton models differing only by translation under a translation-invariant measurement grammar;
- multiple lexical items with identical executable definitions;
- color labels with no internally represented order while a requested comparison presupposes one.

The repair type is:

\[
L_{t+1}=\operatorname{closure}(L_t\cup\{R\})
\]

where the new primitive \(R\) breaks the problematic equivalence.

---

# 5. FAILURE TYPE B — REPRESENTATION TOO FINE

The dual problem is equally important.

A system may distinguish two states that are equivalent for the target:

\[
O(x)=O(y)
\quad\land\quad
x\not\sim_L y.
\]

Call this a **spurious distinction**, **nuisance split**, or **overseparation**.

Example:

> an agent hashes a display containing an irrelevant step counter, causing identical world situations to appear as different states.

The repair is not expansion.

It is compression, quotienting, normalization, masking, or invariance induction.

Conceptually:

\[
L_{t+1}=L_t/N
\]

for a nuisance variable or equivalence relation \(N\).

The system must therefore learn two complementary skills:

```text
LEARN WHAT TO NOTICE
LEARN WHAT TO IGNORE
```

A self-extending intelligence that can only add features will eventually drown in irrelevant distinctions.

---

# 6. SEARCH_FAILURE VS LANGUAGE_LIMIT

This distinction must become a first-class executable object.

## 6.1 SEARCH_FAILURE

The system explored only a finite subset:

\[
L_{\text{explored}}\subset L
\]

and found no discriminator.

That establishes only:

\[
\forall Q\in L_{\text{explored}},\ Q(x)=Q(y).
\]

It does **not** establish:

\[
\forall Q\in L,\ Q(x)=Q(y).
\]

Output:

```yaml
diagnosis: SEARCH_FAILURE
reason: finite_search_exhausted_or_stalled
universal_claim_allowed: false
recommended_action:
  - continue search
  - expand search depth
  - improve synthesis
  - seek better optimizer
  - gather missing experiment/data
```

## 6.2 LANGUAGE_LIMIT

A Language Limit is allowed only when the system possesses a machine-checkable argument that the **entire declared grammar** is blind to the required distinction.

Never infer a language limit from:
- large search volume;
- many failed candidates;
- high compute cost;
- repeated model disagreement;
- model confidence;
- lack of human interpretation.

A language limit is a theorem relative to a frozen grammar.

---

# 7. SYMMETRY CERTIFICATES

The preferred route is symmetry.

Given transformation:

\[
T:X\rightarrow X
\]

and witness:

\[
y=T(x),
\]

suppose every internal primitive is equivariant:

\[
P_i\circ T=T\circ P_i
\]

and terminal aggregation is invariant:

\[
A\circ T=A.
\]

Then for every program generated by the grammar:

\[
Q\circ T=Q.
\]

If:

\[
O(Tx)\neq O(x),
\]

the system may issue a `LANGUAGE_LIMIT_CERTIFICATE`.

Minimum certificate:

```yaml
certificate_id:
language_version:
language_hash:
grammar_hash:

witness:
  x:
  y:
  target_x:
  target_y:

transformation:
  ast:
  family:
  parameters:

proof:
  primitive_equivariance:
  aggregation_invariance:
  closure_rule:
  checker_receipt:

scope:
  applies_to:
  does_not_apply_to:

status:
  - PROVED
  - REFUTED
  - INCONCLUSIVE
```

The scope is mandatory.

Never transform:

> no program in this frozen grammar can distinguish these states

into:

> no algorithm can distinguish these states.

---

# 8. TRANSFORMATION HUNTER

Do not require humans to always supply \(T\).

Add a bounded Transformation Hunter.

Initial transformation families:

```text
TRANSLATION
REFLECTION
ROTATION where defined
PERMUTATION
RELABELING
INVERSION
PARITY_SWAP
TIME_REVERSAL where defined
COORDINATE_REORDERING
OBJECT_RENAMING
NUISANCE_COORDINATE_INSERTION/REMOVAL
```

Required behavior:

```text
candidate collision or spurious split
↓
search transformation family
↓
verify exact relation
↓
test grammar invariance
↓
emit certificate OR return SEARCH_FAILURE
```

Critical null control:

> Given a language whose relations genuinely break all candidate transformations, the Transformation Hunter must be able to return **NO CERTIFIED SYMMETRY**.

A system that finds symmetry everywhere has learned nothing.

---

# 9. REPRESENTATION REPAIR ENGINE

A Language Limit should output a **design constraint**.

For coarse failure under \(T\), candidate repair \(R\) must satisfy:

\[
R(Tx)\neq R(x)
\]

for relevant states.

For nuisance/overseparation failure, a candidate repair should instead remove task-irrelevant distinctions while preserving target-relevant ones.

Repair candidate kinds:

```text
NEW_PRIMITIVE
NEW_RELATION
NEW_SENSOR_CHANNEL
NEW_TEMPORAL_MEMORY
NEW_POSITIONAL_REFERENCE
NEW_OBJECT_IDENTITY
NEW_ORDERING
NEW_ABSTRACTION
NEW_QUOTIENT/INVARIANCE
NEW_NORMALIZATION
NEW_EXPERIMENT
NEW_OPERATOR
```

The repair engine must prefer the **smallest executable change** that removes the certified failure.

Prefer:
- minimal AST size;
- minimal new dependencies;
- clear falsifier;
- clear scope;
- candidate-specific selectivity;
- prospective transfer.

---

# 10. ORB-L BECOMES THE TOWER'S ADMISSION SYSTEM

Do not build ORB-L as a parallel semantic world.

Use:

```text
Language Tower = executable meaning
ORB-L = provenance + admission + validation
```

Every primitive or concept should record:

## Origin

```text
DESIGNER_SUPPLIED
SYSTEM_SYNTHESIZED
EXPERIMENT_DERIVED
EXTERNAL_EVIDENCE
```

## Admission

```text
BUILT_IN
PROVISIONAL
EARNED
REFUTED
DEPRECATED
```

## Validation

```text
UNVALIDATED
PARTIAL
VALIDATED
REFUTED
```

Origin is not evidence.

A system-synthesized primitive is not automatically earned.

---

# 11. EARN CRITERIA

A candidate may become `EARNED` only when all required gates are explicitly satisfied.

Minimum gates:

```text
A. demonstrated representational need
B. executable definition
C. prospective prediction
D. falsification survival
E. incremental value
F. candidate specificity or explicit family-level restatement
G. dependency/provenance completeness
H. scope limitation recorded
```

The candidate must include:
- exact AST;
- parent language hash;
- dependency graph;
- designer-supplied substrate;
- exploratory evidence;
- frozen alternatives;
- prospective evidence;
- counterevidence;
- limitations;
- admission event hash.

---

# 12. THE SELECTIVITY RULE

Permanent regression rule:

> **If many frozen candidates pass the same confirmation, the selected candidate has not been specifically validated.**

Store:

```yaml
selectivity:
  candidate_family_hash:
  frozen_candidate_count:
  survivor_count:
  survivor_fraction:
  selected_candidate:
  selected_rank:
  margin_to_runner_up:
```

If specificity fails:
- keep the candidate `PROVISIONAL`, or
- restate the result at the family level and test that claim prospectively.

Do not retroactively reinterpret broad family success as proof of a particular primitive.

---

# 13. PROSPECTIVE ADMISSION

Positive template:

```text
freeze candidate family
↓
exploratory selection
↓
lock exact candidate AST/hash
↓
freeze untouched challenge suite
↓
evaluate selected candidate and all alternatives
↓
adversarial controls
↓
candidate-specific selectivity
↓
admission review
```

The test suite should contain challenges at which frozen alternatives are expected to fail whenever possible.

---

# 14. ANTI-RESCUE

If a frozen primary requirement fails, the result fails.

Do not rescue with:
- richer features;
- post-hoc threshold changes;
- new seeds chosen after inspection;
- alternate splits;
- a different metric;
- a more flattering secondary model;
- a new dataset;
- new qualifiers.

A modified hypothesis may be tested.

It becomes a **new experiment**.

It does not rewrite the old one.

---

# 15. LANGUAGE SNAPSHOTS

The Tower must expose a versioned, immutable snapshot of its current representational state.

Suggested schema:

```yaml
language_id:
version:
language_hash:
parent_language_hash:

machine:
  word_size:
  instruction_set:
  step_budget:
  output_bounds:

primitive_registry:
  - symbol:
    ast:
    grounding_status:
    origin:
    admission:
    validation:
    dependencies:

grammar:
  constructors:
  composition_rules:
  terminal_aggregations:
  read_ops:
  write_ops:

world_schema:
  object_types:
  relation_types:
  time_model:
  spatial_model:
  truth_model:
  belief_store:
  assertion_store:
  knowledge_rules:

known_invariances:
  - transformation:
    certificate_id:

known_boundaries:
  - boundary_id:
    status:
    evidence:

ignorance_queue:
  - gap_id:
    requested_term_or_operation:
    missing_dependencies:

claim_ledger_hash:
release_hash:
```

This is what future Orbita integration should consume.

Do not expose “1,100 words.”

Expose:

> **exactly what this version can currently mean, prove, refuse, and not distinguish.**

---

# 16. LANGUAGE TOWER META API

Implement an internal meta-layer with functions conceptually equivalent to:

```text
tower.meta.snapshot()
tower.meta.map_equivalence()
tower.meta.find_collision()
tower.meta.find_overseparation()
tower.meta.find_symmetry()
tower.meta.prove_invariance()
tower.meta.issue_language_limit()
tower.meta.propose_repair()
tower.meta.evaluate_repair()
tower.meta.compare_candidate_family()
tower.meta.propose_language_version()
```

These should be callable independently of a UI.

No function may directly mutate the active language.

---

# 17. ROUND-TRIP SEMANTIC COMPRESSION

Human-readable explanation is not automatically grounded.

Any proposed semantic interpretation of a machine-discovered operator should support a round trip:

\[
Q_{\text{machine}}
\rightarrow
C_{\text{human}}
\rightarrow
Q'_{\text{machine}}.
\]

Then test:

\[
Q'(x)=Q(x)
\]

over a frozen confirmation domain.

Possible statuses:

```text
ROUND_TRIP_EXACT
ROUND_TRIP_APPROXIMATE
AMBIGUOUS_COMPRESSION
UNMAPPED_ARCHIVE_PRIMITIVE
COMPRESSION_FAILED
```

Never use `NOVEL_MATHEMATICS` merely because existing interpretation grammars fail.

`UNMAPPED_ARCHIVE_PRIMITIVE` means only:

> the currently registered interpretation archive failed under the frozen criteria.

Historical novelty is a separate literature/expert-review problem.

---

# 18. THE VOICE MUST REMAIN A SAFE TRANSDUCER

The voice layer may not quietly acquire world-writing power.

Enforce:

```text
question read-set
response vocabulary
response parse
response effect
```

For a read-only question, round-trip parsing of the answer must never introduce a write.

Add a universal invariant:

```text
READ_ONLY_INPUT
=>
REPLAYED_RESPONSE_EFFECT ∈ {READ, QUERY, NO_OP}
```

unless an explicit action mode is active.

This is a core safety property, not a UX detail.

---

# 19. IGNORANCE QUEUE BECOMES A RESEARCH QUEUE

Current unknowns should become structured tasks.

Suggested gap types:

```text
UNKNOWN_WORD
UNKNOWN_RELATION
MISSING_GROUNDING
MISSING_SENSOR
MISSING_OPERATOR
MISSING_EXPERIMENT
MISSING_INDIVIDUATING_STRUCTURE
SEARCH_FAILURE
LANGUAGE_LIMIT
NUISANCE_DISTINCTION
UNRESOLVED_AMBIGUITY
HUMAN_CONVENTION
```

Each gap should include:

```yaml
gap_id:
trigger:
blocked_query:
language_version:
missing_dependencies:
candidate_next_actions:
priority:
status:
```

The system may ask a human or LLM for proposals.

No answer enters as truth.

It enters as `EXTERNALLY_SUPPLIED_CANDIDATE` and passes the same admission process.

No shortcut for the owner.  
No shortcut for Claude.  
No shortcut for another model.

---

# 20. DISCOVERY GENOME INTEGRATION

The Discovery Genome should eventually store **methods**, not merely conclusions.

Reusable operator examples:

```text
KILL_SWITCH_VALIDATION
ARTIFACT_MIMICRY_DETECTION
BOUNDARY_FIRST_DISCOVERY
LOCAL_TO_GLOBAL_FORCING
SCALE_NORMALIZED_INVARIANCE
EXECUTABLE_MEANING
FORCING_VERSUS_CAPACITY
MATCHED_COHORT_ABLATION
ORB_L_ADMISSION_GATE
LANGUAGE_LIMIT_CERTIFICATION
NUISANCE_COORDINATE_DETECTION
```

A Genome operator needs:

```yaml
operator_id:
version:
contract_hash:
intervention:
kill_switch:
recovery_test:
held_out_prediction:
required_conditions:
expected_failure_signature:
domains_tested:
evidence:
independence_level:
```

The Tower should be able to propose:

> “This gap resembles a previously successful operator pattern.”

But the operator must be retested under the new domain.

Transfer is evidence, not inheritance.

---

# 21. ORBITA INTEGRATION BOUNDARY

Do not block Tower development on live Orbita integration.

Build a clean adapter.

Future Orbita-facing operations should look conceptually like:

```text
orbita_language_snapshot
orbita_language_audit
orbita_language_limit_certificate
orbita_propose_language_repair
orbita_freeze_language_repair
orbita_evaluate_language_repair
orbita_promote_language_version
```

Orbita remains the authority for:
- frozen plans;
- claims;
- contradictions;
- supersession;
- approval events;
- promotion;
- rollback.

The Tower may propose a version.

It may not promote its own version.

---

# 22. DETERMINISTIC EXECUTION BOUNDARY

Future arbitrary experiments should be executable through a deterministic operator such as DerekX.

Contract:

```text
frozen plan
+ exact runner hash
+ exact input hashes
+ exact environment
→
hash-bound output bundle
```

The execution layer must not issue scientific verdicts.

It reports what ran.

Orbita/governance decides what the result means.

---

# 23. INDEPENDENT VERIFICATION

Where practical, important claims require an independent witness.

Examples:
- Python implementation + C implementation;
- separate parser/compiler implementation;
- separate theorem checker;
- SAT/SMT proof;
- alternate numerical method;
- proof assistant;
- external measurement.

The second or third implementation must not merely share the same code path under a different wrapper.

Shared assumptions are a failure mode.

---

# 24. VACUITY TESTING

Every important test must itself be tested.

Add mechanisms for:

```text
MUTATION_TEST
NEGATIVE_CONTROL
DELIBERATE_BREAK
ASSERTION_INVERSION
RANDOMIZED_IMPLEMENTATION
COUNTEREXAMPLE_SEED
```

A test that cannot fail does not count as evidence.

For every “proof by test suite,” include at least one deliberately broken implementation or input where the suite must fail.

---

# 25. TINY COUNTEREXAMPLES FIRST

Before large random stress tests, search the smallest admissible cases exhaustively.

Permanent rule:

```text
SMALLEST_CASES
→ exhaustive
→ structured adversarial
→ random large-scale
```

Large examples can hide trivial counterexamples.

The benchmark and test harness should preserve the exact first failing size.

---

# 26. CLAIM SCOPE GUARD

Every claim must have an evidence domain.

Before promotion, compare:

```text
evidence_scope
candidate_claim_scope
```

If the claim is broader than the evidence, reject it.

Examples:

Allowed:
> No observable in grammar L distinguishes this witness pair.

Rejected:
> No algorithm can distinguish this witness pair.

Allowed:
> Color order is absent from this Tower representation.

Rejected:
> Color has no intrinsic order in human perception.

Allowed:
> This metaphor mapping is order-reversing under the frozen numerical encoding.

Rejected:
> The system experiences tension.

Scope escalation must fail closed.

---

# 27. THE SUPERINTELLIGENCE LOOP

The long-term loop is:

```text
WORLD / TASK
    ↓
current executable language L_t
    ↓
reason / act / ask
    ↓
detect failure
    ↓
classify failure
    ↓
if ordinary uncertainty:
    search / experiment
else if coarse representation:
    prove blindness
    synthesize distinction
else if too-fine representation:
    identify nuisance
    compress / quotient
    ↓
freeze candidate repair
    ↓
prospective falsification
    ↓
independent verification
    ↓
ORB-L admission review
    ↓
governed promotion
    ↓
L_t+1
    ↓
measure whether future tasks improve
```

The important property is that **future capability changes because earlier representational changes survived evidence**.

---

# 28. WHAT COUNTS AS PROGRESS TOWARD SUPERINTELLIGENCE

Do not use the word because a benchmark score is high.

Use milestones.

## Stage A — Grounded language machine

Can execute meanings, distinguish truth/unknown/assertion, and refuse unsupported operations.

## Stage B — Falsification-governed reasoner

Can generate claims and preserve counterexamples, failed checks, and supersessions.

## Stage C — Representationally self-aware reasoner

Can detect collisions and nuisance splits in its own language.

## Stage D — Language-limit prover

Can autonomously find transformations and certify grammar-wide blindness.

## Stage E — Representation repairer

Can propose minimal symmetry-breaking or nuisance-removing repairs and confirm them prospectively.

## Stage F — Cumulative concept learner

Earlier earned primitives materially improve later tasks.

## Stage G — Cross-domain abstraction learner

An earned operator from one domain accelerates or enables discovery in unrelated domains under new prospective tests.

## Stage H — Architecture improver

The system proposes changes to its own discovery/reasoning machinery and demonstrates that they improve frozen benchmarks without increasing false claims.

## Stage I — Superhuman autonomous discovery

Consistently produces correct, novel, independently verifiable scientific or mathematical results faster or deeper than expert groups.

The current project should not claim Stage I.

Build the machinery that could test whether later stages are actually reached.

---

# 29. THE COMPOUNDING TEST

The most important future benchmark compares two systems over a sequence of tasks.

## Frozen Tower

Always begins with original language \(L_0\).

## Growing Tower

Carries forward only legitimately earned:
- primitives;
- abstractions;
- invariances;
- nuisance removals;
- operators;
- verified compilers;
- experimental templates.

Measure:

```text
time_to_decisive_answer
experiments_to_decisive_answer
false_positive_rate
false_language_limit_rate
refutation_rate
proof_rate
transfer_rate
reuse_of_earned_primitive
number_of_later_tasks_accelerated
regression_rate
compute_per_discovery
```

The north-star result is:

\[
\text{verified prior repairs}
\rightarrow
\text{better future discovery}
\]

without an explosion in unsupported claims.

That is the empirical signature of compounding scientific intelligence.

---

# 30. REQUIRED REGRESSION TESTS

The following should become permanent regression cases.

## Semantics and grounding

1. `IN` does not imply `NEAR`.
2. `PART_OF` is not equivalent to containment.
3. unknown is not false.
4. testimony does not alter world truth.
5. false belief remains distinct from knowledge.
6. identity-only color cannot support “more red” without a grounded ordering.
7. multiple individuals make “the cat” ambiguous and force refusal.
8. voice round-trip cannot turn a read into a write.
9. no skipped test is reported as passed.
10. output overflow must halt or explicitly report overflow.

## Representation audit

11. translation-invariant grammar fails on a translation-sensitive target.
12. adding the targeted positional primitive repairs the held-out distinction.
13. irrelevant added primitive does not count as repair.
14. nuisance step-counter coordinate is identified as task-irrelevant.
15. a symmetry-null language returns no certified symmetry.
16. candidate family success does not imply exact candidate specificity.
17. failed primary confirmation cannot be rescued by secondary analyses.
18. engine inability is not scientific falsification.
19. tiny planted counterexample is found before large random examples are trusted.
20. claim scope cannot exceed evidence scope.

## Governance

21. no language version promotes itself.
22. exact candidate hash mismatch blocks promotion.
23. prior language versions remain reconstructable.
24. refuted concepts remain queryable.
25. admission event records all dependencies and evidence.
26. external teaching remains `EXTERNALLY_SUPPLIED` until earned.

---

# 31. FIRST CLAUDE CODE IMPLEMENTATION PHASES

## Phase 0 — Repository audit

Before editing:

1. inspect the entire repository tree;
2. identify:
   - VM / register machine;
   - compiler;
   - parser;
   - world state;
   - truth/belief/assertion stores;
   - lexicon;
   - grounding registry;
   - release/checksum system;
   - claim ledger;
   - limitation ledger;
   - ignorance queue;
   - symmetry code;
   - cross-language verifier;
   - voice/round-trip tests;
3. run the full current test suite;
4. write:

```text
docs/SUPERINTELLIGENCE_ARCHITECTURE_AUDIT.md
```

Map existing code to this manifesto.

Do not rewrite working subsystems merely to match naming in this document.

## Phase 1 — Versioned Language Snapshot

Implement an immutable language snapshot and validator.

Deliver:
- schema;
- hash;
- parent hash;
- primitive registry;
- grounding status;
- read/write operations;
- world schema;
- known invariances;
- known limits;
- ignorance queue linkage.

No behavior change required yet.

## Phase 2 — Representation Audit Core

Implement:

```text
find_collision
find_overseparation
map_equivalence
```

Start with known deterministic positive controls:
- color relabelings;
- spatial rigidity;
- Rule 3/17 shift blindness if accessible in-repo;
- nuisance clock coordinate if accessible.

Return structured findings only.

No language mutation.

## Phase 3 — Transformation Hunter and Certificate

Implement bounded transformation discovery.

Then implement grammar-invariance proof/checking.

Outputs:
- `SEARCH_FAILURE`
- `LANGUAGE_LIMIT_CERTIFICATE`
- `NO_CERTIFIED_SYMMETRY`
- `INCONCLUSIVE`

Never infer universal blindness from finite enumeration.

## Phase 4 — Repair Candidate System

Given a certificate, propose bounded repair candidates.

Implement both:
- distinction-adding repairs;
- nuisance-removing repairs.

Freeze:
- candidate family;
- parent language hash;
- candidate ASTs;
- expected failure patterns;
- confirmation cases.

## Phase 5 — ORB-L Admission

Add provenance and admission state.

No candidate may become `EARNED` without all required gates.

Persist every version.

## Phase 6 — Prospective Selectivity Harness

Create a reusable harness for:
- candidate lock;
- untouched confirmation;
- candidate-family comparison;
- irrelevant/random controls;
- anti-rescue;
- exact output receipts.

## Phase 7 — External Governance Adapter

Create an interface boundary for future Orbita integration.

Do not fake remote tools.

Implement local data structures and export/import contracts first.

## Phase 8 — Compounding Benchmark

Create a frozen-vs-growing Tower benchmark.

Do not optimize on the test sequence after viewing results.

---

# 32. FIRST PASS DEFINITION OF DONE

Claude Code's first implementation pass is complete when:

- baseline tests are recorded;
- architecture audit exists;
- immutable Language Snapshot exists;
- language hash changes on semantic change;
- snapshot validation catches missing dependencies;
- known grounding statuses are preserved;
- no active meaning changes are introduced accidentally;
- representation audit API exists;
- at least one known collision and one known nuisance split are reproduced;
- symmetry-null control returns no false certificate;
- no language version can self-promote;
- full pre-existing test suite still passes;
- all new tests pass;
- every deviation from this manifesto is documented.

Do **not** attempt all later phases in one uncontrolled rewrite.

Build a vertical slice that is auditable.

---

# 33. WORKING RULES FOR CLAUDE CODE

Before modifying:
- run tests;
- record hashes;
- inspect release format;
- understand how prior claims/refutations are represented.

During implementation:
- prefer additive changes;
- preserve historical artifacts;
- keep APIs small;
- use deterministic tests;
- separate proposal from activation;
- make failure modes explicit;
- record every new magic threshold in configuration or specification;
- add negative controls;
- add mutation/vacuity tests;
- do not silently increase budgets to make tests pass.

Do not:
- rewrite old sealed releases;
- merge truth and assertion;
- map UNKNOWN to FALSE;
- give the voice implicit write access;
- claim human conceptual novelty;
- call a finite failed search a language limit;
- call a language-relative theorem a universal theorem;
- let a repair grade itself;
- auto-promote;
- auto-deploy;
- delete refutations.

---

# 34. THE PRODUCT WE ARE BUILDING

The mature system should be able to say:

> I know this because I can execute and verify it.

> I was told this, but I have not earned it.

> I do not know this yet.

> I searched and failed, but the answer may still exist in my current language.

> I proved my current language cannot express this distinction.

> I can tell you exactly which symmetry causes the blindness.

> I can propose the smallest new primitive that would break that symmetry.

> I tested that primitive prospectively against alternatives.

> It survived, but only under this scope.

> I added it to my language with a complete provenance trail.

> That previous addition later failed, so I rolled it back without erasing the evidence.

> This distinction I used to make was a nuisance, so I learned to ignore it.

> This explanation in English round-trips to the executable meaning I actually discovered.

That is the target.

Not a chatbot that sounds brilliant.

Not a verifier that says yes to whatever its author wants.

Not a model that rewrites itself.

A **falsification-governed, self-extending semantic machine whose intelligence compounds only when new distinctions—or new invariances—earn their way into the language.**

---

# 35. IMMEDIATE COMMAND TO CLAUDE CODE

Begin with **Phase 0 — Repository Audit**.

Then implement **Phase 1 — Versioned Language Snapshot** and the smallest safe slice of **Phase 2 — Representation Audit Core**.

Do not change the active language semantics during the first pass.

At the end, report:

1. repository architecture discovered;
2. current test baseline;
3. files changed;
4. schemas and hashes added;
5. representation-audit APIs added;
6. positive and negative controls executed;
7. test results;
8. conflicts between this manifesto and repository reality;
9. the next exact implementation slice;
10. anything requiring human approval.

The most important invariant is:

> **The Tower may discover that it needs to change. It may not decide by itself that the change is now true.**
