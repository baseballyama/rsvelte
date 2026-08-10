# P2 — legacy reactive statements are re-derived and lowered from text

Category: performance / architecture / maintainability

Evidence: `transform_instance_script_for_visitors` recognizes `$:` from the reconstructed statement text, calls `extract_reactive_statement_deps`, calls `transform_reactive_statement`, reparses the transformed result for state assignments, and stores another `String` for later sorting (`client/mod.rs:5568-5621`). Phase 2 already provides source-ordered `reactive_statement_dependencies`, but Phase 3 still re-derives assignment targets and body structure from text. The corrected profiler split reports `reactive_stmt` at 14.86% of total compile time on smelte, 9.83% on carbon and 2.18% on open-webui (minimum over six runs; `docs/ast-refactor-handoff.md:1374-1390`).

Impact: legacy-heavy applications pay several parses and allocations for every reactive statement, comment relocation must mutate the whole script before those statements are discovered, and Phase 2 and Phase 3 can disagree about statement identity or dependencies. This is also the dominant blocker to retaining valid Phase-2 spans in application corpora: `rehome_reactive_statement_comments` changed 37 carbon and 34 open-webui inputs (`docs/ast-refactor-handoff.md:1716-1757`).

One-PR remediation: retain each top-level reactive statement's typed node, assigned bindings, dependencies and source ordinal in `ComponentAnalysis`; lower that node directly with a client visitor; enqueue typed output in Phase-2 order. Delete only the `$:` branch of `process_accumulated`, `extract_reactive_statement_deps`, its extra state-assignment reparse and reactive-comment text relocation. Do not combine this PR with state/store/prop migration for ordinary statements.

Acceptance: `process_accumulated` never recognizes `$:` from text; no reactive body is reparsed in Phase 3; `rehome_reactive_statement_comments` and its scanner are deleted; reactive ordering, comments and dependency fixtures plus the strict CSR/dev corpus remain byte-identical; the `reactive_stmt` timer and invocation counter are zero on smelte, carbon and open-webui.
