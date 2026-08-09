# P3 — blocker analysis is an unused placeholder presented as an implementation

Category: unnecessary code / maintainability

Evidence: `calculate_blockers` creates unused closures/flags and never mutates analysis (`crates/rsvelte_core/src/compiler/phases/2_analyze/blockers.rs:23-76`); helper TODOs admit missing assignment traversal. Repository search finds no caller. Active async handling lives in phase 3's `shared/async_body.rs`.

Impact: readers can mistake dead code for the official algorithm, future changes may revive an incomplete JSON-based implementation, and unused helpers add maintenance surface without coverage.

Remediation: delete the module if phase 3 owns blocker calculation, or wire and fully port it using retained typed AST. Do not keep a speculative parallel implementation.

Acceptance: there is exactly one tested blocker algorithm corresponding to upstream, with no placeholder functions or dead-code allowances.
