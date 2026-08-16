# Adversarial technical-debt audit

Audit snapshot: `579657fd` (official compatibility target: Svelte 5.56.8).

This directory records one independently actionable debt per file. Findings were accepted only when backed by a concrete code path, an explicit unfinished implementation, or a measured compatibility ratchet. Counts are snapshots, not tolerances: a known failure remains a defect unless the individual file says otherwise.

Priority means:

- P0: can terminate or escape the host process boundary.
- P1: shipped correctness, security, or platform-availability failure.
- P2: bounded compatibility, performance, or maintenance risk.
- P3: cleanup or reproducibility debt with lower immediate user impact.

Each finding contains evidence, impact, remediation, and an acceptance test so it can be converted directly into an issue.

The audit is intentionally hostile to flattering aggregates. Performance findings separate single-component latency from outer batch parallelism, use real-world size distributions instead of only tiny fixtures, and treat allocation density, scaling exponent, repeated parsing/scanning and fallback frequency as first-class budgets. Architecture findings preserve the useful upstream phase mirror while rejecting migration-history folders, ambient state, catch-all modules and text-based shadow compilers inside those phases.

The former aggregate #033 has been split along independently removable production paths. #033 owns legacy reactive statements; #046–#051 own one semantic statement-transform family each; #052 owns Phase-3 metadata rescans; #053 owns unconditional statement assembly; #054–#055 own the two remaining source-mutating prenormalizers; and #031 owns statement-boundary scanning. This deliberately excludes two attractive but falsified performance theories: the dev prop-mutation `Vec<char>` rescans measured only 0.0–1.8x source bytes, and skipping the dev assignment-tail parse produced no reliable win (`docs/phase3-ast-refactor-plan.md:377-455`).

## Findings

### P1

- [011 — client source maps cannot identify token-level origins](011-client-source-maps-are-chunk-granular.md)
- [012 — Vite plugin mutates compiled JavaScript without updating its map](012-vite-postprocessing-invalidates-source-maps.md)
- [013 — compile-error messages and spans remain substantially incompatible](013-error-diagnostics-do-not-match-official.md)
- [031 — client instance-script lowering falls back to a hand-written JavaScript scanner](031-client-instance-script-uses-a-fallible-text-scanner.md)

### P2

- [014 — warning presence and locations still diverge from official Svelte](014-warning-code-and-position-parity-gaps.md)
- [015 — native lint output has 32 false positives and 72 false negatives](015-lint-corpus-has-104-divergences.md)
- [016 — formatter output diverges on six real-world layout clusters](016-formatter-has-six-residual-layout-clusters.md)
- [020 — ESTree fallback printer silently replaces unknown nodes with a comment](020-estree-printer-silently-erases-unknown-nodes.md)
- [021 — analysis and transform paths still materialize typed AST as JSON](021-phase2-phase3-materialize-json-ast.md)
- [022 — prop-read rewriting repeatedly scans and reallocates whole expressions](022-prop-read-transform-rebuilds-expression-per-prop.md)
- [023 — client code generation still reparses opaque Raw chunks and falls back to text printing](023-client-codegen-retains-raw-text-fallback.md)
- [024 — core compiler responsibilities are concentrated in multi-thousand-line modules](024-giant-modules-concentrate-change-risk.md)
- [028 — every OXC dependency is overridden to a development Git revision](028-oxc-git-patch-is-workspace-wide.md)
- [032 — AST representation creates roughly one heap allocation per source byte](032-ast-representation-causes-allocation-per-source-byte.md)
- [033 — legacy reactive statements are re-derived and lowered from text](033-legacy-reactive-statements-are-lowered-from-text.md)
- [034 — batch parallelism masks the single-component performance gap](034-batch-parallelism-masks-single-component-latency.md)
- [035 — client transform module layout encodes migration history instead of semantic ownership](035-client-module-layout-encodes-migration-history.md)
- [036 — wildcard imports hide ownership inside the client transform root](036-client-wildcard-imports-hide-module-ownership.md)
- [037 — svelte-check overlay planning is coupled to filesystem mutation](037-overlay-planning-is-coupled-to-filesystem-mutation.md)
- [038 — client visitors share a large public mutable god object](038-client-transform-state-is-a-mutable-god-object.md)
- [039 — transform state and allocators are hidden in thread-local globals](039-transform-state-and-allocators-live-in-thread-locals.md)
- [040 — the bespoke JavaScript arena relies on an unsafe aliasing contract](040-bespoke-js-arena-relies-on-unsafe-aliasing.md)
- [042 — a generic `utils.rs` has become a second client-transform root](042-generic-utils-module-is-a-second-transform-root.md)
- [043 — async lowering reparses generated JavaScript text as a second compiler](043-async-lowering-reparses-generated-javascript-text.md)
- [044 — store-subscription analysis reimplements JavaScript scope rules with character heuristics](044-store-subscription-analysis-scans-javascript-characters.md)
- [045 — generated JavaScript is repaired by text post-passes](045-generated-javascript-is-repaired-by-text-postpasses.md)
- [046 — legacy state assignments and reads reparse each statement in separate stages](046-legacy-state-assigns-and-reads-reparse-each-statement.md)
- [047 — legacy member mutations are lowered by a separate text pass](047-legacy-member-mutations-are-a-separate-text-pass.md)
- [048 — legacy store lowering scans each statement three times](048-legacy-store-lowering-scans-statements-three-times.md)
- [049 — legacy state declarations use separate destructuring and declaration text pipelines](049-legacy-state-declarations-use-two-text-pipelines.md)
- [050 — legacy prop operations run as three ordered statement passes](050-legacy-prop-operations-run-as-three-ordered-passes.md)
- [051 — `export let` lowering is a nested string pipeline](051-export-let-lowering-is-a-nested-string-pipeline.md)
- [052 — client script metadata is recomputed by six whole-script scans](052-client-script-metadata-is-recomputed-by-six-text-scans.md)
- [053 — statement assembly allocates before transform eligibility is known](053-statement-assembly-allocates-before-transform-eligibility-is-known.md)
- [055 — comma-declaration prenormalization rewrites the whole client script](055-comma-declaration-prenormalization-rewrites-the-whole-script.md)

### P3

- [030 — dormant helpers and future migration scaffolding remain in production modules](030-dormant-dead-code-and-future-scaffolding.md)
- [041 — large production modules also contain thousands of lines of inline tests](041-production-modules-contain-thousands-of-test-lines.md)
- [054 — client class-field prenormalization rewrites the whole script before statement visitors](054-client-class-field-prenormalization-rewrites-the-whole-script.md)
