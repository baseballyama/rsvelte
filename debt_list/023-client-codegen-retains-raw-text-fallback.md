# P2 — client code generation still reparses opaque Raw chunks and falls back to text printing

Category: architecture / performance / maintainability

Evidence: client IR exposes `JsStatement::Raw` and `JsExpr::Raw`, with many producers in `client/mod.rs`. `program_to_oxc` can fail as `unsupported`, `loc-base`, or `chunk-parse` (`js_ast/to_oxc.rs:85-124,1265-1307`), after which client codegen silently uses the handwritten generator (`client/mod.rs:2383-2458`).

Impact: the compiler maintains two printers and a generated-JS parse round trip; correctness, comments, source maps, and performance depend on which path a component happens to trigger.

Remediation: migrate Raw producers to typed arena nodes, make fallback frequency observable in CI, and delete the text printer after the measured corpus reaches zero fallbacks.

Acceptance: all corpus targets use direct AST codegen, fallback counters remain zero, and the obsolete printer path is removed.
