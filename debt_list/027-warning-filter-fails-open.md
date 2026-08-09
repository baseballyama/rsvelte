# P2 — warningFilter failures silently change svelte-check results

Category: configuration compatibility / reliability

Evidence: `apply_warning_filter` documents and implements fail-open behavior when the Node sidecar is missing or fails (`crates/rsvelte_check/src/svelte_check/runner.rs:273-308`). All warnings remain even when project configuration would filter them.

Impact: official svelte-check and rsvelte-check can produce different diagnostics and exit codes depending on sidecar availability, including CI environments that intentionally omit Node.

Remediation: make unevaluated configured filters a structured execution error by default; if fail-open remains available, require an explicit option and expose machine-readable status.

Acceptance: fixtures with `warningFilter: () => false` behave deterministically for missing Node, import failure, timeout, and malformed sidecar response.
