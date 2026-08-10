# P2 — `export let` lowering is a nested string pipeline

Category: performance / architecture / maintainability

Evidence: the legacy export branch detects declarations after stripping comments from text, optionally flattens destructuring, calls `transform_export_let`, rewrites prop reads inside generated defaults, reparses for state assignments/reads and finally performs store reads (`client/mod.rs:5634-5769`). The corrected profiler places the combined `export_let` path at 0.51–3.51% of total compile time across open-webui, carbon and smelte (`docs/ast-refactor-handoff.md:1374-1390`).

Impact: one upstream variable-declaration visitor is represented by a private compiler pipeline over generated JavaScript. Comments and TypeScript syntax complicate keyword detection, nested default expressions cross several parse/print boundaries, and failures can be hidden by fallback to unchanged text.

One-PR remediation: lower scalar and destructured `export let`/`export var` nodes directly from the retained declaration AST, applying prop initialization plus nested state/store expression visits before printing once. Restrict the PR to the early-return export branch; ordinary prop/state/store statement paths remain independent.

Acceptance: the comment-stripping export keyword probe and `PA_EL_*` sub-pipeline are removed; each exported declaration is visited and printed once; scalar/destructured exports, aliases, defaults with callbacks, TypeScript types, stores and comments have parity fixtures; `PA_EXPORT_LET` is zero and strict CSR/dev corpus output remains byte-identical.
