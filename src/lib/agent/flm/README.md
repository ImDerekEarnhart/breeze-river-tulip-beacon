# Fiber Lattice Machine — finite kernel v0

This module is a non-activating prototype of a target-scoped representation architecture.

## Core invariant

The raw `WorldLedger` is immutable. Representation snapshots are views over that evidence. A `QUOTIENT` removes a distinction only from a view; it never deletes the corresponding raw fact.

## Semantic transitions

- `REFINE(+P)`: add a visible primitive/key to break a certified target-relevant fiber collision.
- `QUOTIENT(-N)`: remove a visible key for a declared target scope when the distinction is nuisance variation there.
- `OBSERVE(+E)`: add an admissible observation channel as a proposal; this kernel never executes the external observation.
- `MERGE`: union compatible visible keys from two admitted branches. v0 makes no stronger lattice/completeness claim.

## Governance boundary

`createCandidateDelta` produces an inert, hash-bound candidate. It does not mutate `RepresentationRegistry`. A candidate enters the registry only through an `AdmissionRecord` that projects an already-separate HodgeForm or human review and is bound to the exact candidate hash. The local projection is not proof that Core approved anything.

The proposer may not self-review its candidate. The kernel does not call HodgeForm approval APIs, model providers, tools, or external actions.

## Scope

Exact finite worlds only. Adequacy means the target and declared protected targets are constant on every representation fiber. This does not establish continuous-world validity, performance advantage, universal language sufficiency, scientific novelty, or self-improving intelligence.
