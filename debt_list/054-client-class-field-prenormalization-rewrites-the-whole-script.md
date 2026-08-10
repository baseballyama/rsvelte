# P3 — client class-field prenormalization rewrites the whole script before statement visitors

Category: architecture / performance cleanup

Evidence: when a script contains a class plus `$state` or `$derived`, `transform_instance_script_for_visitors` passes the entire script through `transform_class_fields_client` and replaces the source before statement processing (`client/mod.rs:4672-4687`). This invalidates every retained Phase-2 span even if one class field changed. The applicability study found zero invocations/changes in five real-world production corpora but 60 invocations and 55 changes in the runes fixture population (`docs/ast-refactor-handoff.md:1871-1881`), so fixture-heavy benchmarks overstate its production importance.

Impact: a rare construct forces a whole-script allocation and blocks retained-AST statement iteration for the entire component. Its prominence in fixtures can also misdirect performance work away from actual application hot paths.

One-PR remediation: invoke the existing typed class-field lowering while visiting class declarations and emit edits/nodes for only the affected fields. Remove only the Phase-3 whole-script prenormalization call; do not refactor the class transform module or other rune handling in the same PR.

Acceptance: `PN_INV_CLASS` and `PN_CHG_CLASS` remain zero because the prenormalization stage is gone; all 55 known fixture witnesses exercise the replacement; unchanged surrounding statements retain their original spans; runes/runtime, strict CSR/dev corpus and source-map gates remain unchanged. No performance claim is made from the fixture-only population.
