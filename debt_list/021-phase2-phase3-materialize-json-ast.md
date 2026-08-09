# P2 — analysis and transform paths still materialize typed AST as JSON

Category: performance / type safety / maintainability

Evidence: phase 2/3 and print code contain 41 `to_value` calls, including binding-pattern and identifier extraction paths, while `expression_to_string` calls `as_json` (`crates/rsvelte_core/src/compiler/print/helpers.rs:768-810`). This allocates generic objects/strings and re-dispatches on field names after parsing into typed nodes.

Impact: compilation pays avoidable allocation and traversal costs, loses exhaustive checking, and can silently drift when OXC node schemas change.

Remediation: replace JSON walkers with typed visitors in reference-implementation order; reserve JSON for public serialization boundaries only.

Acceptance: a probe over all phase 2/3 corpus compilation reports zero AST `to_value` materializations, with unchanged output and lower allocation counts.
