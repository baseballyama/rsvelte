# P2 — client code generation still reparses opaque Raw chunks and falls back to text printing

Category: architecture / performance / maintainability

Evidence: client IR exposes `JsStatement::Raw` and `JsExpr::Raw`, with many producers in `client/mod.rs`. The normal path reparses each Raw chunk through `parse_chunk` before esrap printing; measured whole-program text-printer fallback is still 2.59% on bits-ui and 3.86% on flowbite (`docs/phase3-ast-refactor-plan.md`). `program_to_oxc` can fail as `unsupported`, `loc-base`, or `chunk-parse` (`js_ast/to_oxc.rs:85-124,1265-1307`), after which codegen uses the handwritten generator (`client/mod.rs:2383-2458`).

Impact: even successful components pay generated-JS parse round trips, while the residual fallback population selects a second printer. Correctness, comments, source maps, and performance therefore depend on the shape of generated chunks rather than a single typed contract.

Remediation: migrate Raw producers to typed arena nodes, make fallback frequency observable in CI, and delete the text printer after the measured corpus reaches zero fallbacks.

Acceptance: all corpus targets use direct AST codegen, fallback counters remain zero, and the obsolete printer path is removed.
