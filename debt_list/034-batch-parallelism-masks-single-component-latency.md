# P2 — batch parallelism masks the single-component performance gap

Category: performance / benchmarking

Evidence: the published client benchmark is 3.14× faster than official on one thread (742.5 ms versus 236.7 ms) but advertises 21.2× after parallelizing 3,417 independent files; server is 4.43× single-thread versus 27.9× multi-thread (`README.md:201-226`). Parse alone reaches 44× single-thread, localizing the remaining gap after parsing. The corpus averages only ~236 bytes and the README explicitly says fixed cost dominates, while the project goal remains 100× single-thread compile speed.

Impact: throughput across many files is valuable but does not predict first compile, HMR of one changed component, editor diagnostics, WASM hosts without threads, or CPU-limited CI. A green aggregate can coexist with regressions in the latency users feel.

Remediation: add cold/warm single-component benchmarks over realistic size and feature strata, report phase attribution, allocations and p50/p90/p99, and gate single-thread latency separately from batch throughput.

Acceptance: CI has stable regression budgets for representative single-component CSR/SSR/dev builds; reports never substitute multi-thread speedup for single-thread speedup; the 100× goal has an explicit measured burndown by phase.
