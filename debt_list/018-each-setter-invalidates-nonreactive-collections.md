# P2 — each-item setters invalidate collections with no reactive dependency

Category: performance / generated-code parity

Evidence: 90 `each-collection` matrix failures share one cause (`compatibility/matrix-known-failures.md:191-208`): when `transitive_deps` is empty, the client visitor invalidates the collection expression itself for calls, literals, templates, constructors, and closure expressions. Official emits no invalidation.

Impact: generated setters perform unnecessary signal invalidation/evaluation, increasing runtime work and potentially repeating effectful collection expressions.

Remediation: distinguish “no dependencies” from “dependency analysis unavailable” and mirror upstream's empty-set behavior.

Acceptance: all 90 matrix entries clear and runtime tests prove setter execution does not reevaluate dependency-free collection expressions.
