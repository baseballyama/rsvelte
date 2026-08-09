# P2 — formatter output diverges on six real-world layout clusters

Category: formatter compatibility / maintainability

Evidence: `fmt-known-failures.json` contains 19 files partitioned `3 + 8 + 5 + 1 + 1 + 1` (`compatibility/fmt-known-failures.md:8-25`). Residue spans tag hugging, attribute/directive breakpoints, embedded-JS member chains, expression joining, OXC parentheses/types, and native CSS indentation.

Impact: switching to `rsvelte-fmt` creates persistent formatting churn and makes mixed-tool teams unstable despite the exact fixture suite passing.

Remediation: fix each measured document-layout mechanism rather than file-specific output; keep embedded JS/CSS ownership explicit and add minimized fixtures before shrinking the ratchet.

Acceptance: the 19-entry ratchet reaches zero on Linux and macOS with no oracle exclusions added.
