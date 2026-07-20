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
└── typescript-go/           # tsgo — type-check backend for Wave 2 svelte-check
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
- No backward compatibility for internal APIs (refactor freely)

### Corpus output-equality pipeline (`scripts/compat-corpus/`)

Every `.svelte` / `.svelte.(js|ts)` source (including markdown code blocks) from every corpus
source repository — sveltejs/svelte, sveltejs/svelte.dev, and the real-world projects bits-ui /
flowbite-svelte / melt-ui / shadcn-svelte, all pinned as submodules and listed in
`scripts/compat-corpus/corpus-sources.json` — is compiled with both the official compiler and
rsvelte for CSR **and** SSR. Outputs must be byte-identical after comparison-side normalization
(oxfmt + blank-line stripping — never compiler post-passes). To grow the corpus, add a submodule
plus a line to `corpus-sources.json`. CI ratchet: `compat/corpus/known-failures.{client,server}.json`
may only shrink, and each remaining failure is justified in `compat/corpus/known-failures.md`. See
[scripts/compat-corpus/README.md](scripts/compat-corpus/README.md).

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

Pre-commit hooks run `cargo fmt` and `cargo clippy` automatically (`.githooks/pre-commit`).

### Docker (optional)

A `Dockerfile` and `docker-compose.yml` provide a reproducible toolchain (Rust nightly + Node 22 + pnpm). There is no wrapper script — invoke Compose directly:

```bash
docker compose up -d            # Start dev container
docker compose exec dev bash    # Open a shell inside it
docker compose exec dev cargo test
```

VS Code Dev Containers ("Reopen in Container") also works.

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

### Maintaining This File

- Document new knowledge and patterns discovered during development
- Update test status and feature lists as work progresses
- Remove outdated information and keep it concise

## Test Status

Source: `pnpm run compatibility-report` (Svelte **v5.56.3**). Re-run `pnpm run test-and-update`
to refresh. Skip lists live in `crates/rsvelte_core/tests/compatibility_report.rs` and
`crates/rsvelte_core/tests/runtime.rs`; `crates/rsvelte_core/tests/audit_skipped.rs`
re-checks every skipped fixture after a Svelte bump.

| Suite | Pass/Total |
|-------|------------|
| Parser Modern | 26/26 |
| Parser Legacy | 82/82 |
| Compiler Errors | 145/145 |
| Compiler Snapshot | 29/29 |
| CSS | 181/181 |
| Validator | 333/333 |
| SSR | 97/97 |
| Hydration | 80/80 |
| Runtime Legacy | 1206/1206 |
| Runtime Runes | 999/999 |
| Runtime Browser | 32/32 |
| Print | 43/43 |
| Preprocess | 19/19 |
| Sourcemaps | 0/0 (no fixtures yet) |
| svelte2tsx | 253/253 |
| Migrate | 0/76 (out of scope) |

All in-scope fixtures pass (100.0%). The 76 `migrate` fixtures (Svelte 4 → 5 migrator) are
intentionally out of scope: rsvelte is a Svelte 5 compiler port, not a migration tool. Do
not start migrate work without an explicit scope change.

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

## Ecosystem Port

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 253/253, wired into the compatibility report |
| 2 | svelte-check | ✅ v1.0 — walker + overlay + tsgo + incremental cache + watch + parallel compile + hires source maps + SvelteKit kit-file augmentation; reads diagnostic-relevant `compilerOptions` from `svelte.config.*` and `vite.config.*` |
| 3 | vite-plugin-svelte | 🟢 v1.0 — Rust NAPI bindings (`hmr_diff` / `resolve_id` / `preprocess`) + `@rsvelte/vite-plugin-svelte` shim at `apps/npm/vite-plugin-svelte`; supports Vite 6/7/8 |
| 4 | svelte-language-server | ⛔ Deferred — CLI type checking is covered by svelte-check; LSP waits on tsgo `tsserver` mode upstream |

`rsvelte_lint` (native Svelte linter: validator/a11y wrap + a native port of
`eslint-plugin-svelte`'s rules, `crates/rsvelte_lint`) ships as its own npm package,
[`@rsvelte/lint`](apps/npm/lint), fixed-versioned with `@rsvelte/compiler` via Changesets.
Its real-world parity corpus ratchet lives at `compat/lint-corpus/`.

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
