# P1 — client source maps cannot identify token-level origins

Category: debugging / ecosystem compatibility

Evidence: `compatibility/sourcemap-known-failures.json` contains 74 failures. The documented root cause is that client-generated chunks receive a single source start rather than token-level locations (`compatibility/sourcemap-known-failures.md`). Raw chunks are reparsed and their local spans shifted into synthetic coordinate regions (`crates/rsvelte_core/src/compiler/phases/3_transform/js_ast/to_oxc.rs:1265-1314`).

Impact: browser stack traces, breakpoints, coverage, and downstream transform maps can point to the wrong Svelte token even though generated JS bytes match.

Remediation: carry original spans on every synthesized AST token/node through client transforms and emit mappings from those spans; do not infer origin from a whole text chunk.

Acceptance: all official sourcemap anchors pass and both structural budgets reach zero without loosening invariants.
