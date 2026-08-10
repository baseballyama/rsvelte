# P2 — legacy prop operations run as three ordered statement passes

Category: performance / architecture

Evidence: ordinary legacy statements run prop update lowering, prop-source read wrapping and prop assignment lowering as three ordered `pa_stage` calls (`client/mod.rs:6018-6089`). The measured `prop_assignments` stage alone costs 0.92–1.80% of total compile time across smelte, carbon and open-webui (`docs/ast-refactor-handoff.md:1374-1390`). Debt #004 covers scanner correctness and debt #022 covers per-prop rescanning inside expressions; this finding is specifically the statement-level scheduling and parse boundaries between all three prop operations.

Impact: `x++`, `x` and `x = value` are three cases of one binding-aware expression visitor, but the current chain relies on textual pass order to avoid invalid forms such as `x()++` or double wrapping. Intermediate strings are allocated and reparsed, and fixing either existing prop debt without removing this orchestration leaves the pipeline fragile.

One-PR remediation: run update, read and assignment cases in one typed visitor over each retained statement, with binding identity distinguishing bindable, non-bindable, read-only and rest props. Replace only the three ordinary-statement stages; export defaults and rest/read-only access remain separately scoped.

Acceptance: `PA_PROP_UPDATE_EXPRESSIONS`, `PA_PROP_SOURCE_READS` and `PA_PROP_ASSIGNMENTS` record zero statement calls; no intermediate prop-transformed JavaScript is reparsed; tests cover direct/call-position reads, updates, compound/logical assignments, invalidation bodies and shadowing; strict CSR/dev corpus and source-map gates remain unchanged.
