# Compatibility system

This directory is the evidence base for rsvelte compatibility. It contains three different kinds of data that must not be treated as interchangeable.

## 1. Shrink-only baselines

Tracked `*known-failures*.json` files are CI ratchets. Their paired Markdown files justify every remaining class of divergence. They are machine-facing paths used by JavaScript, Rust tests, and GitHub Actions, so their root-level names are intentionally stable.

| Area             | Baselines                                    | What is compared                                                        |
| ---------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| Compiler output  | `known-failures.*`                           | Normalized JavaScript and CSS for client, server, and client-dev        |
| Diagnostics      | `warning-*`, `error-*`, `validator-*`        | Codes, messages, positions, end positions, and frames as separate gates |
| Output validity  | `parse-*`, `sourcemap-*`                     | Emitted JavaScript parseability and source-map invariants               |
| Ecosystem        | `fmt-*`, `lint-*`, `svelte2tsx-*`, `check-*` | Formatter, linter, TSX projection, and project diagnostics              |
| Generated gates  | `matrix-*`, `mutation-*`, `css-prune-*`      | Cross-product cases and corpus-seeded mutations                         |
| Internal rollout | `dual-run-*`                                 | Implementation-to-implementation checks during refactors                |

See [gate-coverage.md](gate-coverage.md) for the blind spots of every gate and [known-failures.md](known-failures.md) for compiler-output residue.

## 2. Stable fixtures

- `pattern-corpus/` contains minimized real defect shapes that moving upstream repositories cannot preserve.
- `check-fixtures/` contains complete projects for svelte-check diagnostic parity.

These are tracked inputs. They are not generated reports.

## 3. Generated artifacts

`sources/`, `expected/`, `actual/`, `manifest.json`, and `report.json` are reproducible working data and are gitignored. A passing verifier removes large output trees; a failing verifier keeps them for diagnosis.

The public website does not read the ratchets directly. The reporting scripts convert them into versioned, reviewable artifacts:

- `apps/playground/static/compatibility-report.json`
- `apps/playground/static/performance-report.json`

Generate and preview them with:

```bash
pnpm report:compatibility
pnpm report:competitors:install
pnpm report:performance
pnpm dev:docs
```

The performance report uses the collected real-world component files byte-for-byte. It forms a separate accepted-file set for each pinned Svelte version class, reports warmed medians and variation, and never substitutes an unrelated workload for a missing compiler API.

## Safety rules

- Rebase or merge `main` before updating a baseline.
- Never update a baseline from a target subset, formatting-disabled run, or incomplete corpus.
- Do not infer coverage from a green gate; consult `gate-coverage.md` for what its comparison omits.
- Do not move baseline paths without updating the JavaScript path contracts, Rust gates, CI artifact paths, documentation, and cleanup allowlists together.
