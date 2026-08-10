# P2 — analysis and transform paths still materialize typed AST as JSON

Category: performance / type safety / maintainability

Evidence: the repository's allocation study records 54 `JsNode::to_value` call sites (`docs/phase3-ast-refactor-plan.md:501-593`), including binding-pattern and identifier extraction paths, while `expression_to_string` calls `as_json` (`crates/rsvelte_core/src/compiler/print/helpers.rs:768-810`). Earlier counters instrumented only the lazy-cache caller and therefore materially undercounted this path. Each conversion allocates generic objects/strings and re-dispatches on field names after parsing into typed nodes.

Impact: compilation pays avoidable allocation and traversal costs, loses exhaustive checking, and can silently drift when OXC node schemas change.

Remediation: replace JSON walkers with typed visitors in reference-implementation order; reserve JSON for public serialization boundaries only.

Acceptance: per-call-site instrumentation covers every AST-to-JSON conversion; phase 2/3 corpus compilation reports zero conversions outside explicit public serialization boundaries, with unchanged output and lower allocation counts.
