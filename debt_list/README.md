# Adversarial technical-debt audit

Audit snapshot: `c19c67ec` (official compatibility target: Svelte 5.56.8).

This directory records one independently actionable debt per file. Findings were accepted only when backed by a concrete code path, an explicit unfinished implementation, or a measured compatibility ratchet. Counts are snapshots, not tolerances: a known failure remains a defect unless the individual file says otherwise.

Priority means:

- P0: can terminate or escape the host process boundary.
- P1: shipped correctness, security, or platform-availability failure.
- P2: bounded compatibility, performance, or maintenance risk.
- P3: cleanup or reproducibility debt with lower immediate user impact.

Each finding contains evidence, impact, remediation, and an acceptance test so it can be converted directly into an issue.

## Findings

### P0

- [001 — C ABI compiler panics abort the embedding process](001-c-api-panic-aborts-host.md)

### P1

- [002 — svelte-check overlay follows symlinks outside the workspace](002-overlay-symlink-write-escape.md)
- [003 — the native Vite binding detects musl packages that are never shipped](003-missing-musl-native-packages.md)
- [004 — prop transforms parse generated JavaScript with ad-hoc character scanners](004-prop-transforms-parse-javascript-as-text.md)
- [005 — parameter defaults and computed keys lose reactive dependencies](005-parameter-defaults-lose-reactive-dependencies.md)
- [006 — special elements bypass shared directive validation and lowering](006-special-element-directive-validation-drift.md)
- [007 — experimental async-derived lowering has multiple semantic failures](007-async-derived-lowering-is-incomplete.md)
- [008 — semantics-preserving comments still change generated behavior](008-mutation-gate-has-behavioral-code-mismatches.md)
- [009 — C API silently coerces invalid enum options to defaults](009-c-api-invalid-options-silently-default.md)
- [010 — incremental svelte-check cache can reuse stale generated code](010-incremental-cache-key-can-reuse-stale-tsx.md)
- [011 — client source maps cannot identify token-level origins](011-client-source-maps-are-chunk-granular.md)
- [012 — Vite plugin mutates compiled JavaScript without updating its map](012-vite-postprocessing-invalidates-source-maps.md)
- [013 — compile-error messages and spans remain substantially incompatible](013-error-diagnostics-do-not-match-official.md)

### P2

- [014 — warning presence and locations still diverge from official Svelte](014-warning-code-and-position-parity-gaps.md)
- [015 — native lint output has 32 false positives and 72 false negatives](015-lint-corpus-has-104-divergences.md)
- [016 — formatter output diverges on six real-world layout clusters](016-formatter-has-six-residual-layout-clusters.md)
- [017 — client child processing never tracks bound contenteditable context](017-contenteditable-context-is-hard-coded-false.md)
- [018 — each-item setters invalidate collections with no reactive dependency](018-each-setter-invalidates-nonreactive-collections.md)
- [019 — runes-mode `{@html}` opening-tag validation is skipped](019-html-tag-runes-validation-is-unimplemented.md)
- [020 — ESTree fallback printer silently replaces unknown nodes with a comment](020-estree-printer-silently-erases-unknown-nodes.md)
- [021 — analysis and transform paths still materialize typed AST as JSON](021-phase2-phase3-materialize-json-ast.md)
- [022 — prop-read rewriting repeatedly scans and reallocates whole expressions](022-prop-read-transform-rebuilds-expression-per-prop.md)
- [023 — client code generation still reparses opaque Raw chunks and falls back to text printing](023-client-codegen-retains-raw-text-fallback.md)
- [024 — core compiler responsibilities are concentrated in multi-thousand-line modules](024-giant-modules-concentrate-change-risk.md)
- [026 — overlay source-map persistence errors are ignored](026-overlay-source-map-write-errors-are-ignored.md)
- [027 — warningFilter failures silently change svelte-check results](027-warning-filter-fails-open.md)
- [028 — every OXC dependency is overridden to a development Git revision](028-oxc-git-patch-is-workspace-wide.md)

### P3

- [025 — blocker analysis is an unused placeholder presented as an implementation](025-unused-blocker-analysis-is-placeholder-code.md)
- [029 — benchmark installs its lint oracle without a lockfile](029-benchmark-installs-unlocked-oracle.md)
- [030 — dormant helpers and future migration scaffolding remain in production modules](030-dormant-dead-code-and-future-scaffolding.md)
