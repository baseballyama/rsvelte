# P2 — client visitors share a large public mutable god object

Category: architecture / readability / correctness

Evidence: `ComponentClientTransformState` spans `client/types.rs:1811-2116` and exposes dozens of public inputs, output queues, flags, counters, maps and mutation channels. It duplicates `dev` and `preserve_whitespace` despite marking both deprecated in favor of `options`, uses `Rc<Cell<_>>`/`Rc<RefCell<_>>` for cross-visitor signaling, and stores deferred failure as `pending_error: Option<String>`.

Impact: visitors depend on temporal mutation order that types cannot express; cloning the context can share some state and copy other state; stale booleans leak across nested traversal; adding a feature expands every caller's ambient authority. Duplicate options can disagree at runtime.

Remediation: separate immutable compilation inputs, typed output builders, scoped traversal frames and explicitly owned accumulators. Replace one-shot booleans with RAII/scoped APIs and return typed errors immediately. Remove duplicate option fields.

Acceptance: visitors receive the narrow capabilities they require; nested state restoration is structural rather than manual; no deprecated duplicate fields, public `Cell`/`RefCell` channels or pending string error slot remain; compile-fail tests enforce capability boundaries.
