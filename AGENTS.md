# AGENTS.md

Guidelines for AI agents working on this project. `CLAUDE.md` is a symlink to this file.

## Project Goals

This project is a complete port of the official Svelte compiler in Rust.

1. **100% Test Compatibility** - Pass all tests from the `svelte/compiler` test suite
2. **100x Performance** - Achieve 100x speed via Rust optimizations and parallelism
3. **Drop-in Replacement** - Provide N-API bindings compatible with existing tools (Vite, etc.)
4. **OXC Integration** - Design for integration into the [oxc](https://oxc.rs/) ecosystem

## Architecture

Directory structure mirrors the official Svelte compiler at `submodules/svelte/packages/svelte/src/compiler/`.

```
crates/rsvelte_core/src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings)
└── 3_transform/ # Code generation (AST → JS/CSS)
```

Upstream reference repos live under `submodules/`:

```
submodules/
├── svelte/                  # Svelte 5 compiler (mirror target)
├── language-tools/          # svelte2tsx, language-server, svelte-check, typescript-plugin, svelte-vscode
└── typescript-go/           # tsgo — type-check backend for svelte-check (CLI) and the LSP (server mode)
```

The `@rsvelte/vite-plugin-svelte` Vite plugin (a fork of `@sveltejs/vite-plugin-svelte`)
is vendored as a workspace package at `apps/npm/vite-plugin-svelte`, not a submodule.

**Phase-3 output codegen is AST-based.** Server SSR is pure-AST (the legacy text generator
is deleted); client CSR defaults to `js_ast::to_oxc` → `rsvelte_esrap`, with the text printer
kept only as a fallback for comment-bearing / unsupported-node programs. The remaining string
processing (client visitors building `Raw` strings, `shared/async_body.rs`, the `.svelte.js`
module path) is internal IR construction with unchanged output — a maintainability cleanup only.

**Key Design Decisions:**

- Memory-efficient layout (u32 positions, compact_str)
- Thread-safe parser with rayon parallelism
- Direct AST passing (no re-parsing between phases)
- Retained Phase-1 programs are immutable; Phase 3 uses source-range transforms and falls back after text rewrites
- No backward compatibility for internal APIs (refactor freely)

### What each gate cannot see ([`compatibility/gate-coverage.md`](compatibility/gate-coverage.md))

The sections below describe what the ~19 gates *do* compare. Every one of them can be green
while a real defect ships, because each has a field its comparison key drops, a normalization
step that erases the divergence, or a population its unit never reaches — and rediscovering
those blind spots ad hoc has cost this project several shipped bugs (#2403, #2424, #2425).
`compatibility/gate-coverage.md` is the inventory: per gate, the unit compared, what it
structurally cannot observe with the responsible flag/field/filter cited by file and line, and
evidence classified as a **discriminating case**, a **structural argument from code**, or an
explicit **unmeasured**. Never fill a row with a plausible guess — an unsupported blind-spot
claim is worse than a blank, because the next person reads the row as surveyed.

**When adding a gate, add its row before the ratchet is first baselined**, and answer "what
does this gate not look at?" — which is not the same question as "what inputs does it not
have". Corpus size is the saturated axis; the two that still find defects are what we compare
and how inputs are constructed.

### Corpus output-equality pipeline (`scripts/compat-corpus/`)

Every `.svelte` / `.svelte.(js|ts)` source (including markdown code blocks) from every corpus
source repository — sveltejs/svelte, sveltejs/svelte.dev, and the real-world projects bits-ui /
flowbite-svelte / melt-ui / shadcn-svelte, all pinned as submodules and listed in
`scripts/compat-corpus/corpus-sources.json` — is compiled with both the official compiler and
rsvelte for CSR, SSR **and** dev-mode CSR (the three targets declared in
`scripts/compat-corpus/targets.mjs`). Outputs must be byte-identical after comparison-side normalization
(oxfmt + blank-line stripping — never compiler post-passes). To grow the corpus, add a submodule
plus a line to `corpus-sources.json`. CI ratchet: `compatibility/known-failures.{client,server,client-dev}.json`
may only shrink, and each remaining failure is justified in `compatibility/known-failures.md`. Every
ratchet is two-sided: a new failure **and** a listed entry that already passes both fail CI, so the PR
that fixes entries must re-baseline in the same PR instead of leaving a backlog for a later one. The
same directory holds three sibling shrink-only ratchets, each with per-entry justification in a paired
`.md`: the formatter-parity gate (`fmt-known-failures.json` / `fmt-oracle-excluded.json`), the
svelte2tsx output-parity gate (`svelte2tsx-known-failures.json`), and the lint output-parity gate
(`lint-known-failures.json`). svelte2tsx additionally gates its **source map** (ratchet
`svelte2tsx-map-known-failures.json`), because the TSX-text gate cannot see the map at all. The two
maps are segmented too differently to diff (byte, decoded-set and lookup-equality parity all hold for
~0% of the corpus), so the gate asserts that rsvelte's map is **structurally well-formed** rather
than equal to official's — using official only to calibrate the invariants. See
[scripts/compat-corpus/README.md](scripts/compat-corpus/README.md).

The same `verify.mjs` run also gates compiler **warnings** — `(code, line, column)` per entry —
on ratchets of their own (`warning-known-failures.{client,server,client-dev}.json` and
`warning-position-known-failures.*`, justified in `compatibility/warning-known-failures.md`).
Codes and positions ratchet separately: a wrong set of codes is a semantic bug, a wrong position
is one systemic cause, and folded together the larger position backlog would hide every semantic
regression. Until #2281 the pipeline discarded `result.warnings` entirely, so this whole class was
invisible **by construction, at any corpus size** — that is how #2256 shipped while the corpus
scored the very entry that reproduces it as `MATCH`. When adding a gate, ask what the oracle does
not look at, not only what the input does not contain.

Compiler **errors** ratchet the same way and for the same reason
(`error-message-known-failures.{client,server,client-dev}.json` and
`error-position-known-failures.*`, justified in `compatibility/error-known-failures.md`). The
output verdict compares an error's `code` and nothing else, and that field is **saturated**: 0
divergences over the 2,843 `(id, target)` pairs both compilers reject. The message text (121
entries) and `start` position (403) were invisible until they were captured, so growing the
corpus could never have found them — the same lesson as the warning gate, one field over.

### Generated shape matrix (`scripts/compat-corpus/matrix/`)

A **generated**, not collected, differential corpus (`pnpm run corpus:matrix`, #2281 Gate 2),
ratcheted through `compatibility/matrix-known-failures.json` with per-cluster justification in
the paired `.md`. Two declarative axis families in `matrix/axes.mjs` — binding kind × syntactic
position, and comment kind × insertion slot — expanded into ~2,000 comparisons that run in
**~5 s** and need only `submodules/svelte` plus the NAPI binding, so it gates every PR.

It exists because the collected corpus samples the **marginal** distribution of published code
while every bug in the #2253/#2254/#2255/#2256 batch was an **interaction**: #2254's shape occurs
**0 times in 14,026 real files**, #2253's likewise, and `client`/`server` were at 0 known failures
— saturated — when all four were reported. Adding real-world repos cannot fix that; only
generating the product can. **Corpus size is no longer the axis worth growing.** The two that are:
what we compare (warning parity above) and how inputs are constructed (this).

Normalization is deliberately identical to `verify.mjs`, so a divergence this gate reports is one
the corpus gate would also report. `--update-baseline` refuses to run under `--no-fmt` or a
`--families` subset (both would FALSE-SHRINK the ratchet).

### Corpus-seeded mutation fuzz (`scripts/compat-corpus/mutate-corpus.mjs`)

The generalization of the matrix (`pnpm run corpus:mutate`, #2281 Gate 3): the 14,027 corpus
entries stop being the test set and become a **seed set**. One semantics-preserving comment is
inserted at a line boundary inside a `<script>` region and parity is required on the mutant.
PRs get a deterministic sample; main gets the full sweep (which is what the two-sided ratchet
needs). It found **#2351** (a comment containing `}`/`)`/`;` in a `$:` block body **aborts the
client compiler with SIGSEGV**) and **#2347** (a `//` comment before a `$props()` pattern's
closing brace swallows the `$.rest_props` initializer — output parses, attributes silently
vanish) in its first run.

**Only the code class is ratcheted.** A divergent mutant is `code-mismatch` when the difference
survives normalizing comments, whitespace and trailing commas away, `comment-mismatch`
otherwise. The full sweep yields 213 of the former and 13,242 of the latter; ratcheting per id
without that split would be a 13,000-entry file that churns on every submodule bump. Comment
fidelity is ratcheted per id by Gate 2 instead, on generated seeds that do not move when a
submodule bumps. Delimiter-carrying comments find code divergences **2.81×** as often as plain
ones (22.4 vs 8.0 per 1,000 mutants) — the #2253 signature.

Compilation runs in child processes (mirroring `compile.mjs`): a panic aborts the process, so a
single-process sweep loses the whole run to one bad mutant — which is what happened first. The
worker prints `IDX <i>`, the parent names the crashing seed, records `compiler-crash`, resumes.

**Corpus artifacts clean themselves up.** A full run writes ~0.57 GiB of regenerable trees per
checkout (`sources/` 60 MiB, `expected/` 254 MiB, `actual/` 254 MiB), and N parallel agent
worktrees each hold a set — this filled the dev machine's disk twice. `verify.mjs` therefore
deletes `expected/` + `actual/` after a **passing** run (`svelte2tsx-verify.mjs` likewise for the
`-s2t` trees); a **failing** run keeps them so a divergence can still be diffed, as does CI and as
does `--keep-artifacts`. `compile.mjs` aborts up front when free disk is below
`180 MiB × targets + 512 MiB`. `pnpm run corpus:clean` reclaims everything regenerable across
this checkout and every `.claude/worktrees/*` sibling — never the checked-in `*known-failures*`
ratchets. Because a verify against an absent tree would score every entry `match`, `verify.mjs`
asserts ≥99% of manifest entries have compiled output before comparing, and refuses
`--update-baseline` below 12000 corpus entries (the FALSE-SHRINK trap: `--update-baseline` deletes
every baseline id it did not measure) — `--update-warning-baseline` is held to the same floor.

The svelte-check diagnostic-parity gate is the odd one out: its unit is a **type-checked project**,
not per-file text, so module resolution / workspace layout / the `.d.ts` environment are observable
there and nowhere else. Layer 1 (`check-verify.mjs`, ratchet `check-known-failures.json`) runs
committed mini-projects under `compatibility/check-fixtures/`; Layer 2 (`check-e2e-verify.mjs`,
ratchet `check-e2e-known-failures.json`) runs real repositories — `submodules/cmsaasstarter` and the
`submodules/skeleton` pnpm monorepo — installed from their own lockfiles.

## Implementation Principles

**CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `submodules/svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `submodules/svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

### Code Comments

Keep comments to the minimum WHY. Do not narrate WHAT the code does line by line, do not
record change history / PR / issue numbers / provenance, and do not add section-banner
comments. Write a comment only when there is a constraint or reason that the code itself
cannot express, and keep it to a single line.

## Development Workflow

### Setup

```bash
git submodule update --init --recursive
git config core.hooksPath .githooks
pnpm install
pnpm run generate-fixtures  # Required before running tests
```

### Build & Test

```bash
cargo build                                          # Build
cargo test                                           # Run all tests
cargo test --release                                 # Release mode (recommended for full runs)
cargo test --test parser_fixtures -- --nocapture     # Run a single suite
pnpm run compatibility-report                        # Generate compatibility report JSON
pnpm run test-and-update                             # Refresh report + docs
```

A **debug** run needs `RUST_MIN_STACK=33554432` — the value CI already sets
(`ci.yml`). Without it `ast_gate_preconditions` and `runtime::test_runtime_legacy`
abort with a stack overflow, which reads as a defect in whatever you just changed.
`--release` does not need it.

Pre-commit hooks run `cargo fmt` and `cargo clippy` automatically (`.githooks/pre-commit`).

### Docker (optional)

A `Dockerfile` and `docker-compose.yml` provide a reproducible toolchain (Rust nightly + Node 22 + pnpm). There is no wrapper script — invoke Compose directly:

```bash
docker compose up -d            # Start dev container
docker compose exec dev bash    # Open a shell inside it
docker compose exec dev cargo test
```

VS Code Dev Containers ("Reopen in Container") also works.

### grep can return nothing and mean nothing

Four ways `grep` has silently reported "no matches" for strings that were
present. All of them produce a confident empty result, so a negative grep is
never on its own evidence that something is absent — confirm with a positive
control on a string you know is there.

| Symptom | Cause | Fix |
|---|---|---|
| `grep X file` finds nothing that is there | `grep` is a shell function wrapping `ugrep --ignore-files`, which skips gitignored paths | `command grep` |
| `Binary file … matches`, no lines printed | one NUL byte anywhere in the file (not non-ASCII — UTF-8 is fine) | `command grep -a`, or `git grep` |
| `git show rev:file \| grep X` finds nothing | the wrapper's `-I` discards binary-looking **stdin** | `git grep X rev -- file` |
| later matches missing | `\| head -N` truncates with no error | state the denominator, or drop the cap |

Related: in `cmd \| head`, `$?` is `head`'s status, not `cmd`'s. Never read a
verdict through a pipe.

### Working with Subagents

Use the `Agent` tool for substantial work — feature implementation, multi-file refactors, broad code exploration, or anything likely to consume meaningful context.

- `Explore` — codebase exploration and search across many files
- `Plan` — design implementation strategy before non-trivial work
- `general-purpose` — multi-step implementation and research
- For trivial single-file edits, work directly without spawning a subagent.

### Commit Guidelines

- Commit frequently, one logical change per commit
- Run `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings` before committing
- Push immediately after committing
- Releases are automated via Changesets Release PRs
- A **brand-new** platform package cannot be published by CI: npm OIDC trusted publishing
  only works for a name that already exists. Bootstrap it once with
  `pnpm run bootstrap-platform-packages -- --run <ci-run-id> --yes`, attach the trusted
  publisher on npmjs.com, then re-run the release

### Maintaining This File

- Document new knowledge and patterns discovered during development
- Update test status and feature lists as work progresses
- Remove outdated information and keep it concise

## Test Status

Source: `pnpm run compatibility-report` (Svelte **v5.56.8**). Re-run `pnpm run test-and-update`
to refresh. The runtime skip lists and the fixture-generation compile options are shared
constants in `crates/rsvelte_core/tests/common/mod.rs`, so the report and the gates
(`tests/runtime.rs`, `tests/ssr.rs`) always measure the same thing;
`crates/rsvelte_core/tests/audit_skipped.rs` re-checks every skipped fixture after a
Svelte bump.

| Suite | Pass/Total |
|-------|------------|
| Parser Modern | 27/27 |
| Parser Legacy | 81/81 |
| Compiler Errors | 145/145 |
| Compiler Snapshot | 30/30 |
| CSS | 181/181 |
| Validator | 333/333 |
| SSR | 99/99 |
| Hydration | 79/79 |
| Runtime Legacy | 1207/1207 |
| Runtime Runes | 1007/1007 |
| Runtime Browser | 32/32 |
| Print | 43/43 |
| Preprocess | 19/19 |
| Sourcemaps | 29/29 (output equality; map correctness has its own gate below) |
| svelte2tsx | 253/253 |
| Migrate | 0/76 (out of scope) |

All in-scope fixtures pass (100.0%). The 76 `migrate` fixtures (Svelte 4 → 5 migrator) are
intentionally out of scope: rsvelte is a Svelte 5 compiler port, not a migration tool. Do
not start migrate work without an explicit scope change.

### Source-map gate

The `Sourcemaps` row above only compares generated `client.js` / `server.js` output. Map
*correctness* is gated by
`crates/rsvelte_core/tests/sourcemaps_gate.rs`, which ports the `_config.js` anchor assertions
from `packages/svelte/tests/sourcemaps` and adds two structural budgets (official segments
reproduced; segments pointing outside the source), ratcheted shrink-only through
`compatibility/sourcemap-known-failures.json` with per-entry justification in the paired `.md`.
Server maps are accurate; client maps are chunk-granular (issue #1781) and are the burndown
target — regenerate the baseline with `UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core
--test sourcemaps_gate -- --ignored sourcemap_gate_measure`.

### Formatter parity corpus (svelte.dev)

Asserts rsvelte formats real svelte.dev sources byte-for-byte like an **oxfmt(`svelte: true`)**
oracle (`prettier-plugin-svelte` for Svelte structure + the oxc engine for embedded JS/CSS),
so a diff isolates rsvelte's Svelte-structure formatting. Oracle outputs are precomputed by
`pnpm run generate-fmt-corpus` (gitignored, CI-cached by svelte.dev SHA). Stage 1+2
(`crates/rsvelte_formatter/tests/svelte_dev_corpus.rs`) covers every `.svelte` file and
` ```svelte ` markdown block; Stage 3 (`crates/rsvelte_fmt/tests/svelte_dev_markdown.rs`) runs
the real `rsvelte-fmt` CLI on whole `.md` files. Both need a runnable `oxfmt` and no-op when
absent. **Hard gate, no baseline tolerance:** any divergence fails CI.

`rsvelte-fmt` formats CSS in-process via the Rust `oxc_formatter_css` crate (the same engine
`oxfmt` uses, byte-identical without a subprocess) — for embedded `<style>` blocks, standalone
`.css`/`.scss`/`.less` files, and the wasm formatter. `--no-native-css` reverts to the legacy
`oxfmt`-subprocess path. Native-CSS parity is covered by
`crates/rsvelte_formatter/tests/css_native.rs` and `crates/rsvelte_fmt/tests/cli.rs`.

`rsvelte_fmt` is a lib + bin: `rsvelte_fmt::FormatSession` runs the CLI's
`--stdin --stdin-filepath` pipeline (config discovery, option layering, extension
dispatch) in process, so an embedder never re-implements it.

## Ecosystem Port

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 253/253, wired into the compatibility report |
| 2 | svelte-check | ✅ v1.0 — walker + overlay + tsgo + incremental cache + watch + parallel compile + hires source maps + SvelteKit kit-file augmentation; reads diagnostic-relevant `compilerOptions` from `svelte.config.*` and `vite.config.*` |
| 3 | vite-plugin-svelte | 🟢 v1.0 — Rust NAPI bindings (`hmr_diff` / `resolve_id` / `preprocess`) + `@rsvelte/vite-plugin-svelte` shim at `apps/npm/vite-plugin-svelte`; supports Vite 6/7/8 |
| 4 | svelte-language-server | 🚧 In progress — target is a full replacement for `svelte-language-server` + `svelte-vscode`, not a companion. M0 landed: `crates/rsvelte_language_server` (binary `rsvelte-language-server`) does document sync, formatting and push diagnostics in process |

Wave 4 architecture (decided; tsgo ships an LSP server as of TypeScript 7, so the earlier
"waits on tsgo `tsserver` mode" blocker no longer applies):

- The server is a **Rust binary** (`crates/rsvelte_language_server`) calling `rsvelte_core`
  directly. `@rsvelte/language-server` becomes a thin launcher — the JS boundary is dropped
  because `forward_map`, source maps and lint `Fix`/`Suggestion` data never crossed it.
- **TypeScript features proxy a child tsgo LSP** over an in-memory `.svelte` → virtual `.tsx`
  overlay, reusing `svelte_check/{overlay,mapper,kit_file}.rs`. tsgo has no plugin API, so the
  server owns `.ts`/`.js` documents too instead of porting upstream's `typescript-plugin`.
- **HTML/CSS language features are implemented natively in Rust** (vendored MDN data), not
  delegated to `vscode-{html,css}-languageservice`.
- Ships its own TextMate grammar / language definition and accepts upstream `svelte.*`
  settings, so users replace the official extension rather than running both.

`rsvelte_lint` (native Svelte linter: validator/a11y wrap + a native port of
`eslint-plugin-svelte`'s rules, `crates/rsvelte_lint`) ships as its own npm package,
[`@rsvelte/lint`](apps/npm/lint), fixed-versioned with `@rsvelte/compiler` via Changesets.
Its real-world parity corpus ratchet lives at `compatibility/lint-known-failures.json`.

### Type-aware lint suite (out-of-workspace)

`crates/rsvelte_lint_types` (the corsa/`tsgo` type-aware backend) is its **own Cargo
workspace** — it path-depends on `submodules/corsa-bind`, whose corsa client stack
nothing else needs, so the root `cargo test` and the CI shards never build it (nor
does the root `cargo fmt` / `clippy`). `submodules/corsa-bind` is **public**; it
clones with no credentials. Run the suite with `pnpm run test:type-aware-lint`,
which checks out the submodules, installs the **pinned**
`@typescript/native-preview` (`scripts/dev/type-aware-lint/package.json` — exact
version because upstream publishes dated dev builds and the tests assert exact
diagnostic text), and runs the 9 tests. A missing binary **fails** instead of
skipping. Do not point it at `$TSGO_BIN`: that names a batch `tsc`/`tsgo` for
`rsvelte-check`, whereas this backend needs a `--api` server (`$CORSA_EXECUTABLE`).
`.github/workflows/type-aware-lint.yml` runs fmt + clippy + the suite on changes to
the crate, weekly, and on dispatch.

Because it is a separate workspace, its `Cargo.lock` is never re-resolved by the root
`cargo test` — any in-repo crate version bump (a Changesets release, a manual
`rsvelte_esrap` bump) staleifies it, and the `--locked` suite above only notices on the
next PR that happens to touch the lint crates. The `Lint-types lockfile` job in `ci.yml`
runs `scripts/ci/check-lint-types-lock.mjs` on **every** PR (resolution only — no
compilation) so drift fails on the PR that introduces it; `pnpm run fix:lint-types-lock`
repairs it. `pnpm run version-packages` re-runs the same check after `sync-version`, so a
release PR cannot ship a stale pin.

## Quick Reference

### Adding Features

1. Check `submodules/svelte/packages/svelte/src/compiler/phases/{phase}/` for the reference implementation
2. Implement in the corresponding Rust module under `crates/rsvelte_core/src/compiler/phases/`
3. Run tests: `cargo test`
4. Debug differences with `node scripts/diff/compare-parsers.mjs`

### Documentation Updates

```bash
pnpm run test-and-update  # Updates README.md
```

### Compatibility Report

Default output path: `fixtures/{svelte-short-commit}/compatibility-report.json` (the
`fixtures/` directory is generated, not checked in). Override with
`node scripts/dev/update-docs.mjs --report <path>`. Tracks test results over time.
