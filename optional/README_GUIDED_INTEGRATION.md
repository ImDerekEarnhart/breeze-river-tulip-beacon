# Guided Executable Systems Handoff

**Target:** the restored **Guided** application tree. This ZIP is **not** a standalone app and does **not** contain Hodgeform Core. Restore Guided first, then review/copy the overlay.

## What is included

- `overlay/src/lib/agent/flm/` — exact finite Fiber Lattice Machine kernel: canonicalization, ledger, partition auditing, candidate deltas, admission binding, identifiability, probing, registry, routing.
- `overlay/src/lib/agent/orb1/` — exact `Q(i)[Z^d]` ORB-1 arithmetic/operator admission implementation.
- `overlay/src/lib/agent/receipts*` — `guided-receipt/1` canonical hash-chain interchange.
- `overlay/src/lib/agent/tower/` — finite fiber auditor + frozen local language snapshot/pipeline contracts.
- `overlay/tests` and `overlay/scripts/*.test.mjs` — executable tests for FLM, ORB-1, receipts, Tower fibers, and Hodgeform adapter parity.
- `candidate_adapters/hodgeform/` — previous Guided MCP/OAuth/protocol adapter code. **Diff against the restored Guided tree; do not overwrite newer Hodgeform wiring blindly.**
- `optional_plugins/arc_falsifier/` — source + tests only from the locally reproduced ARC falsifier/representation-repair agent; no cached results or recordings.
- `optional_tools/orb1_python/` — independent exact arithmetic/admission falsification scripts.
- `optional_tools/ha_ir/` — HA-IR v0.2/v0.3 executable modules and benchmark runners only.
- `optional_tools/spectral_fiber_frozen/` — frozen exact-fiber runner + frozen inputs/approval metadata only.

## Deliberately excluded

Manuscripts, research dossiers, UI screenshots/assets, blind-prediction dump, large result tables, prose architecture essays, ARC recordings/results, and the Erdős–Gyárfás domain repo are not in this package. The EQ archive contains no standalone EQ engine implementation, so no EQ manuscript was substituted for code.

## Integration order

1. Restore the current Guided repo/scaffold.
2. Read its current `AGENTS.md` and platform skill contracts.
3. Diff `overlay/` against Guided. Port modules individually; keep newer auth/PWA/routing/scaffold code.
4. Treat `candidate_adapters/hodgeform/` as reference candidates only until the restored Hodgeform connector is inspected.
5. Run the tests before wiring any module into the active path.
6. Keep FLM candidate creation non-mutating and require separate exact-hash admission.
7. Keep ORB-1 quarantine fail-closed for operators outside the exact coefficient language.
8. `guided-receipt/1` is an interchange receipt, not Hodgeform Core approval.

## Fast validation

From this package root:

```bash
node --experimental-strip-types --test overlay/tests/flm-kernel.test.mjs \
  overlay/scripts/orb1.test.mjs \
  overlay/scripts/receipts.test.mjs \
  overlay/scripts/tower-fibers.test.mjs \
  overlay/scripts/hodgeform-adapter.test.mjs

python optional_tools/orb1_python/orb1_step_zero_exact_check.py
python optional_tools/orb1_python/orb1_operator_admission_check_v1.py

cd optional_plugins/arc_falsifier && python -m pytest -q
```
