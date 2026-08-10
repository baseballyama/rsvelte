# P2 — legacy store lowering scans each statement three times

Category: performance / algorithmic complexity / architecture

Evidence: the `PA_STORES` block applies `transform_store_sub_calls`, `transform_store_assignments_client` and `transform_store_reads_client` serially to the same evolving statement string (`client/mod.rs:6090-6128`). The corrected profiler attributes 0.14% of total compile time on smelte, 0.37% on carbon and 2.41% on open-webui to this block (`docs/ast-refactor-handoff.md:1374-1390`). This is separate from Phase-2's character-based store-subscription discovery recorded by debt #044.

Impact: call, write and read forms of the same store binding are recognized by three text traversals after OXC has already parsed them. Each stage must rediscover lexical context and preserve the exact output of the previous stage, increasing both asymptotic work and semantic drift risk.

One-PR remediation: implement the official store read/call/assignment cases in one typed client statement visitor keyed by Phase-2 binding identity. Replace only the three calls inside `PA_STORES`; do not include Phase-2 subscription discovery (#044), state lowering or prop lowering in this PR.

Acceptance: an eligible statement is traversed once for all store operations; the three production text helpers are deleted or have no instance-script callers; `PA_STORES` text-input bytes and calls are zero; fixtures cover reads, calls, compound/update assignments, nested scopes and `$`-prefixed non-stores; strict CSR/dev output stays byte-identical.
