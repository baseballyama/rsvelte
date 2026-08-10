# P2 — AST representation creates roughly one heap allocation per source byte

Category: performance / data design

Evidence: allocation profiling across huly, open-webui, carbon and SMUI measures 1.183–1.366 heap-allocation events per input byte and 33.5–42.0 copied bytes per input byte; a 3 KB component performs about 4,000 heap allocations (`docs/phase3-ast-refactor-plan.md:239-275`). No local hot spot dominates: 26–32 sites are required to reach half the bucket. `Expression::from_node` boxes each expression, while JSON objects allocate a `String`, `IndexMap` slot and SipHash work for keys drawn from only 88 static names.

Impact: allocator traffic scales directly with source size and explains why compilation remains uniformly heavy even when individual functions are tuned. Per-node boxes and generic JSON maps also destroy locality and make parallel workers contend for allocator/cache resources.

Remediation: redesign the retained AST/IR around arena-backed typed nodes, interned/static field identities and borrowed source slices; remove JSON materialization and owned-string cloning from internal traversal. Optimize representation cohorts, not isolated sites below the measurement floor.

Acceptance: representative real-world corpora have a tracked allocation/source-byte budget substantially below the current 1.183 minimum, copied bytes/source-byte regressions fail CI, and output/diagnostic/source-map parity remains unchanged.
