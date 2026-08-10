# P2 — client script transformation scales superlinearly with script size

Category: performance / algorithmic complexity

Evidence: the checked-in profiler study fits per-file cost against script bytes on 2,454 huly samples. `script_text` consumes 36.6% of production client compile time with exponent 1.395 and 39.6% in dev with exponent 1.242; every sibling bucket is below exponent 1.0 (`docs/phase3-ast-refactor-plan.md:345-375`). It carries roughly half of total compile-cost growth, with the per-statement line loop identified as most of that bucket.

Impact: large real components become disproportionately slower even though the headline benchmark is dominated by ~236-byte fixtures. This penalizes interactive Vite rebuilds and cannot be repaired by adding outer Rayon parallelism to a single component.

Remediation: replace the multi-pass text line loop with one typed traversal, avoid whole-script reconstruction between visitor stages, and benchmark by size decile so wins cannot be hidden by tiny fixtures.

Acceptance: `script_text` is eliminated or its fitted exponent is at most 1.0 with confidence bounds on all four real-world corpora; p50/p90 latency for large components is ratcheted and output equality remains exact.
