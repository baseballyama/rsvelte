# P2 — legacy state assignments and reads reparse each statement in separate stages

Category: performance / architecture

Evidence: ordinary legacy statements pass through `state_assigns_combined_ast::transform_state_assigns_ast` and later through `wrap_state_vars_in_expr` inside distinct `pa_stage` calls (`client/mod.rs:5960-5988,6186-6206`). Each stage receives and may replace a `Cow<str>` rather than sharing the retained statement node. The measured `state_assigns` stage consumes 1.09–2.12% and `state_reads` 0.76–1.38% of total compile time across smelte, carbon and open-webui (`docs/ast-refactor-handoff.md:1374-1390`).

Impact: one semantic state operation is implemented as an ordered string pipeline, so direct assignments and reads pay separate traversal, parse, allocation and printing costs. The order is load-bearing and makes either transform unsafe to reuse independently.

One-PR remediation: extend the existing typed state pipeline to consume one retained statement node and perform direct assignment/update lowering and read wrapping in a single visitor. Return typed output to the caller and remove only the ordinary-statement `PA_STATE_ASSIGNS` and `PA_STATE_READS` stages; leave member mutation, declarations, stores, props and reactive statements to their own debts.

Acceptance: each ordinary legacy statement enters at most one state visitor and is not parsed or printed between assignment and read lowering; both `PA_STATE_ASSIGNS` and `PA_STATE_READS` counters are zero; state assignment/update/read fixtures and strict CSR/dev corpus output remain byte-identical; the paired benchmark reports the combined replacement separately from code-layout noise.
