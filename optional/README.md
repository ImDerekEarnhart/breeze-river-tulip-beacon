# Optional plugins — quarantined

These trees came from `GUIDED_EXECUTABLE_SYSTEMS_HANDOFF_2026-08-21`. They are **not** on the Guided fast path, **not** Hodgeform Core, **not** a Language Tower VM, and **not** official ARC-AGI-3 / Opaque Fiber v1.0.1 scores.

Integration policy from `README_GUIDED_INTEGRATION.md`:

1. Restore Guided first (this tree).
2. Diff overlay modules individually. Overlay FLM, ORB-1, receipts, and the finite fiber auditor are already live as local controls.
3. `candidate_adapters/hodgeform/` was inspected against `src/lib/agent/hodgeform/`. Hashes matched. **Do not overwrite.**
4. Tests run before any wiring into the active path.
5. FLM candidates stay inert until exact-hash external admission. The proposer cannot self-review.
6. ORB-1 quarantine stays fail-closed for operators outside `Q(i)`.
7. `guided-receipt/1` is interchange, not Core approval.

## Layout

| Tree | Role | Wired |
| --- | --- | --- |
| `arc_falsifier/` | Local ARC representation-repair agent, source + tests only | no |
| `ha_ir/` | HA-IR v0.2 / v0.3 modules and runners | no |
| `orb1_python/` | Independent exact `Q(i)` arithmetic / admission falsifiers | no |
| `spectral_fiber_frozen/` | Frozen exact-fiber runner + frozen inputs | no |

Caches (`.pytest_cache`, `__pycache__`, `.pyc`) were not copied.

`arc_falsifier` declares `requires-python >= 3.11`. Local pytest on this sandbox (3.10) still passed 10 tests. That is a quarantine result, not a Core theorem and not an official ARC-AGI-3 score.


Do not import these modules from `src/lib/agent/tools.ts` or the orchestrator.
