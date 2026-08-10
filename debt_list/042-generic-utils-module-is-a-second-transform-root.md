# P2 — a generic `utils.rs` has become a second client-transform root

Category: architecture / readability / maintainability

Evidence: `client/visitors/shared/utils.rs` is 7,021 lines and mixes expression transformation, shadowing, assignment lowering, reactive-reference collection, template effects, directive parsing, literal evaluation, blocker extraction, purity/definedness/state/call/await analysis and JSON compatibility walkers. It imports and mutates the full component context rather than providing small dependency-free utilities.

Impact: unrelated domains depend on one catch-all module, cycles are avoided by convention, and “utility” changes can affect nearly every visitor. The generic name conceals policy and makes the official Svelte counterpart difficult to identify.

Remediation: extract cohesive services matching upstream helpers/visitors; separate pure queries from context-mutating builders; delete JSON-era variants as typed traversal lands. A `utils` module should contain only small, domain-neutral primitives.

Acceptance: no generic utility module owns compiler policy; each extracted module has one semantic reason to change and an explicit dependency direction; JSON and typed duplicate analyzers are consolidated.
