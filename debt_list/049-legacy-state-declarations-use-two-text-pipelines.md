# P2 — legacy state declarations use separate destructuring and declaration text pipelines

Category: performance / architecture / maintainability

Evidence: `process_accumulated` first calls `transform_legacy_destructure_declarations` and later `transform_legacy_state_declarations`, producing text that a subsequent state-read pass must understand (`client/mod.rs:6137-6184`). The latter alone measures 0.64–1.54% of total compile time across the corrected smelte/carbon/open-webui minima (`docs/ast-refactor-handoff.md:1374-1390`).

Impact: two functions reconstruct declarators from strings even though declaration kind, binding pattern and initializer already exist in the parsed AST. Multi-declarator ordering is encoded as a pass-order comment instead of a typed invariant, and another traversal is required to avoid wrapping declaration identifiers as reads.

One-PR remediation: add one typed variable-declaration visitor that lowers scalar and destructured legacy state declarators together, emitting the same declaration sequence from binding metadata. Remove only `PA_LEGACY_DESTRUCTURE_DECLARATIONS` and `PA_LEGACY_STATE_DECLARATIONS` from ordinary statement processing.

Acceptance: scalar, multi-declarator, object/array destructuring, defaults, rest elements, TypeScript annotations and dev ownership variants are covered; both declaration-stage counters are zero; no declaration is serialized and reparsed solely to protect its identifiers from the read pass; strict CSR/dev corpus output remains byte-identical.
