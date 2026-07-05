# AGENTS.md

Guidelines for AI agents working on this project. `CLAUDE.md` is a symlink to this file.

## Project Goals

This project aims to create a complete port of the official Svelte compiler in Rust.

1. **100% Test Compatibility** - Pass all tests from `svelte/compiler` test suite
2. **100x Performance** - Achieve 100x speed using Rust optimizations and parallelism
3. **Drop-in Replacement** - Provide N-API bindings compatible with existing tools (Vite, etc.)
4. **OXC Integration** - Design for integration into [oxc](https://oxc.rs/) ecosystem

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

### Corpus output-equality pipeline (`scripts/compat-corpus/`)

Every `.svelte` / `.svelte.(js|ts)` source (including markdown code blocks)
from every corpus source repository — sveltejs/svelte, sveltejs/svelte.dev, and
the real-world projects bits-ui / flowbite-svelte / melt-ui / shadcn-svelte, all
pinned as submodules and listed in `scripts/compat-corpus/corpus-sources.json`
(~12,000 entries) — is compiled with both the official compiler and rsvelte for
CSR **and** SSR, and the outputs must be byte-identical after comparison-side
normalization (oxfmt + blank-line stripping — never compiler post-passes). It is
one unified corpus (no separate "ecosystem" track); to grow it, add a submodule
+ a line to `corpus-sources.json` (see the README). CI ratchet:
`compat/corpus/known-failures.json` may only shrink. See
[scripts/compat-corpus/README.md](scripts/compat-corpus/README.md),
[docs/corpus-remaining-work.md](docs/corpus-remaining-work.md) (burn-down
playbook for the remaining entries), and
[docs/phase3-server-ast-remaining-work.md](docs/phase3-server-ast-remaining-work.md)
(Phase-3 AST refactor status + handoff). **Phase-3 OUTPUT codegen is now AST:**
server SSR is pure-AST (legacy text generator, ~32k lines, deleted) and client CSR
defaults to `js_ast::to_oxc` → `rsvelte_esrap` (the 3324-line text printer is now a
~6% fallback for comment-bearing / unsupported-node programs). Remaining text
processing is the INTERNAL IR construction (client visitors building `Raw` strings
that `to_oxc` re-parses; `shared/async_body.rs` ~3100 lines of string-based async
splitting; the `.svelte.js` module path) — output is unchanged, so it is an
elegance/maintainability cleanup tracked in the handoff doc.

**Key Design Decisions:**

- Memory-efficient layout (u32 positions, compact_str)
- Thread-safe parser with rayon parallelism
- Direct AST passing (no re-parsing between phases)
- No backward compatibility for internal APIs (refactor freely)

## Implementation Principles

**CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `submodules/svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `submodules/svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

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

A `Dockerfile` and `docker-compose.yml` are provided for a reproducible toolchain (Rust nightly + Node 22 + pnpm). There is no `docker-dev.sh` wrapper — invoke Compose directly:

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

- Commit frequently after each logical change
- Run `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings` before committing
- Push immediately after committing
- Use atomic commits (one logical change per commit)

### Maintaining This File

- Document new knowledge and patterns discovered during development
- Update test status and feature lists as work progresses
- Remove outdated information
- Keep it concise

## Test Status

Source: `pnpm run compatibility-report` (generated 2026-06-08, Svelte commit `a9f48540e236`, **v5.56.3**). Re-run `pnpm run test-and-update` to refresh. Skip lists live in `crates/rsvelte_core/tests/compatibility_report.rs` and `crates/rsvelte_core/tests/runtime.rs`; `crates/rsvelte_core/tests/audit_skipped.rs` re-checks every skipped fixture after a Svelte bump.

| Suite | Pass/Total | Notes |
|-------|------------|-------|
| Parser Modern | 26/26 | All executed fixtures pass — `tag-type-identifier-probe-comment` (Svelte 5.56.1 #18330: `{type instanceof /* probe */ Object}` parses as an expression tag, with the interior `/* probe */` comment attached as `leadingComments` on `Object`) and `loose-declaration-tag` (5.56.1 #18353 loose `{let x = a / }` → empty-name declarator) both unblocked. |
| Parser Legacy | 82/82 | |
| Compiler Errors | 145/145 | `declaration-tag-trailing-slash` (Svelte 5.56.1 #18350) ported — an unterminated declaration tag (`{let x = a /`) now reports `unexpected_eof` instead of silently succeeding (the body scan uses `find_matching_bracket`, which returns `None` at EOF). |
| Compiler Snapshot | 29/29 | All executed fixtures pass — `dedupe-templates` (Svelte 5.56.0 #18320), `props-identifier` (5.56.0 #18252), and `select-with-rich-content` (5.56.0 #18320 select rich-content path) unblocked by the 5.56.0 port. |
| CSS | 181/181 | Deep descendant-chain pruning + `:where(...)` inner scoping ported (Svelte 5.53.7 `0965028d3`). |
| Validator | 333/333 | All executed fixtures pass — `animation-each-with-declaration-tag` (Svelte 5.56.2 #18366) ported: the keyed-`{#each}` animate-directive single-child check now excludes `DeclarationTag` nodes (mirrors upstream's `validate_element` child filter adding `n.type !== 'DeclarationTag'`), in `2_analyze/visitors/each_block.rs::child_count`. `declaration-tag-state-referenced-locally` (5.56.1 #18348) and `declaration-tag-invalid-type-2` (5.56.1 #18330) also pass. |
| SSR | 97/97 | HtmlTag SSR class-hash inlining + synthetic `<option value>` ported (Svelte 5.53.6, 5.55.9). |
| Hydration | 80/80 | All executed fixtures pass — `boundary-pending-attribute` unblocked by the 5.55.3 `@const` blocker port (expression-bodied assignment thunks). |
| Runtime Legacy | 1206/1206 | All executed fixtures pass — `let-directive-and-const-tag-slotted` (Svelte 5.55.10 / 5.56.0 #18271) unblocked by emitting let: directives before consts via a new `state.let_directives` slot. |
| Runtime Runes | 999/999 | All executed fixtures pass. |
| Runtime Browser | 32/32 | |
| Print | 43/43 | All executed fixtures pass — `declaration-tag-division` (Svelte 5.56.1 #18353) handled: `find_matching_bracket` now treats a `/` after a string literal (`'ab' / divisor`) as division, so division-in-initializer declaration tags round-trip alongside the existing `declaration-tag` (5.56.0 #18282). |
| Preprocess | 19/19 | Each fixture's `_config.js` JS preprocessor hand-ported in `crates/rsvelte_core/tests/common/preprocess_fixtures.rs` |
| Sourcemaps | 0/0 | No fixtures yet |
| svelte2tsx | 253/253 | Wave 1 of the ecosystem port — error fixtures now compared via `expected.error.json` start/end offsets. Driven by `crates/rsvelte_core/tests/common/svelte2tsx.rs`. The `language-tools` bump added 6 fixtures; three needed port work: `$props()` typedef insertion now counts the real declaration-keyword length (`const`=5, not a hardcoded `let`=3); hoisted interfaces emit in topological-promotion order (base before extender, mirroring upstream `HoistableInterfaces`); and non-leading `{#snippet}` blocks inside `{#each}` are hoisted above sibling `{const}`/`{let}` declaration tags (port of upstream `hoistSnippetBlock`). |
| Migrate | 0/76 | **Out of scope** — rsvelte is a Svelte 5 compiler port, not a Svelte 4 → 5 migration tool |

**Compatibility report total (Svelte 5.56.3): all in-scope-run fixtures passing (100.0%, 0 failures, 0 errors). 5.56.3 is a runtime/types-only patch — svelte#18384 (guard that a boundary exists before calling its error handler in an async derived) and #18388 (`$state.snapshot` bigint `Primitive` type), both under `internal/client` / `ambient.d.ts` — with no changes under `packages/svelte/src/compiler/`. The compiler output is therefore unchanged from 5.56.2: fixtures regenerate identically and every category stays at 100%. The 76 `migrate` fixtures are intentionally out of scope.**

### Formatter parity corpus (svelte.dev)

Asserts rsvelte formats real svelte.dev sources byte-for-byte like an
**oxfmt(`svelte: true`)** oracle — `prettier-plugin-svelte` for the Svelte structure +
the oxc engine for embedded JS/CSS, the exact layering rsvelte-fmt uses, so a diff
isolates rsvelte's Svelte-structure formatting. Oracle outputs are precomputed by
`pnpm run generate-fmt-corpus` into `fixtures/fmt-corpus/<svelte.dev-sha>/` (gitignored,
CI-cached by svelte.dev SHA) using the canonical config
`scripts/fixtures/fmt-corpus.oxfmtrc.json` (spaces/2/80 = rsvelte defaults). Three stages:

- **Stage 1+2** — `crates/rsvelte_formatter/tests/svelte_dev_corpus.rs`: every `.svelte`
  file (`files/…`) **and** every ` ```svelte ` code block in markdown (`blocks/…`, with
  svelte.dev highlight markers `/// file:` / `+++` / `---` / `// ---cut---` stripped;
  unparseable blocks skipped). Formats via `rsvelte_formatter::format` with an
  oxfmt-backed `<style>` callback.
- **Stage 3** — `crates/rsvelte_fmt/tests/svelte_dev_markdown.rs`: runs the real
  `rsvelte-fmt` CLI on each whole `.md` (`markdown/…`) vs a direct-oxfmt oracle —
  guards that `.md` delegation + config forwarding stay a faithful pass-through.

Both need a runnable `oxfmt` (env `FMT_CORPUS_OXFMT` / `OXFMT_BIN`; default
`node_modules/.bin/oxfmt`) and no-op with a notice when the corpus or oxfmt is absent.
**Hard gate, no baseline tolerance:** every sample must match the oracle byte-for-byte,
so any divergence fails CI — remaining gaps are fixed in the formatter, not tolerated.
`FMT_CORPUS_SHOW=N` raises the printed-failure cap for burndown.

**CSS engine (native, in-process).** As of the `oxc_formatter_css` port, `rsvelte-fmt`
formats CSS in-process via the Rust `oxc_formatter_css` crate (0.57.0, same git-pinned
oxc rev as `oxc_formatter`) — the same engine `oxfmt` uses, so byte-identical without a
subprocess. This covers **both** embedded `<style>` blocks (`rsvelte_formatter::format`'s
`style_formatter` is wired to `native_style_formatter`) **and** standalone
`.css`/`.scss`/`.less` files (a native pipeline in `rsvelte_fmt::main`, mirroring native
JS/JSON: overrides / `printWidth > 320` / parse errors fall back to `oxfmt`). `--no-native-css`
reverts to the legacy `oxfmt`-subprocess `<style>` path (batch + daemon + on-disk cache
machinery, now opt-in only). The wasm formatter (`rsvelte_fmt_wasm`) uses the native
callback too, so `<style>` blocks format in the browser (previously left verbatim, since
spawning `oxfmt` can't run in wasm). Indented-syntax dialects (`sass`/`stylus`/`.styl`) are
not brace-based CSS and stay verbatim / delegated. The corpus above still drives its
oracle-side `<style>` through the `oxfmt` binary by design (to isolate Svelte-structure
diffs); native-CSS parity is covered by `crates/rsvelte_formatter/tests/css_native.rs` and
the `native_*` / `no_native_css*` cases in `crates/rsvelte_fmt/tests/cli.rs`.

Status at svelte.dev@`49ee73732aef`, oxfmt 0.53.0, svelte 5.56.2: **Stage 1+2 944/1148**
(burning down from an initial 726; cleared: mustache-tag indentation, void self-closing,
final newline, mixed-text re-indentation, block-body text re-indentation), **Stage 3
638/638**. Remaining clusters are the harder prettier HTML layout behaviors — inline
element collapse/keep-on-one-line (~51), long open-tag wrapping + child breaking (~26),
pure-text collapse, plus small items (`{@const}`/`{let}` statement formatting,
comment/element separation, a few docs blocks with intentionally-invalid code). (Non-svelte
code blocks are out of scope — both sides format them with oxfmt.)

### Ports landed for skip-reduction (Svelte 5.53.0+)

- **HtmlTag `is_controlled`** (Svelte 5.53.8 `0206a2019`) — fragment / html_tag visitor branches in `crates/rsvelte_core/src/compiler/phases/3_transform/client/visitors/{html_tag.rs,shared/fragment.rs}`. Unblocked 11 fixtures across runtime-runes, runtime-legacy, hydration.
- **`$.update_derived` helpers on derived `++` / `--`** (Svelte 5.53.2 `6aa7b9c64`) — `transform_script.rs::rewrite_derived_update_expressions` rewrites `count()++`/`++count()` shape into `$.update_derived(count)` / `$.update_derived_pre(count)` after the bare-read wrap pass. Unblocked `derived-update-server`.
- **`<option>` synthetic-value via `transform_store_refs`** (Svelte 5.53.6 `e3d277b00`) — `select_element.rs` now routes the synthetic value expression through `transform_store_refs` so `$label` becomes `$.store_get(...)`. Unblocked `select-option-store-implicit-value`.
- **Bare-derived `$derived(visible)` collapse** (Svelte 5.55.5 `b771df3`) — `transform_script.rs::unthunk_bare_derived_arg` rewrites `$.derived(() => visible())` back to `$.derived(visible)` when the inner is a known derived. Unblocked `derived-dep-set-while-rendering`.
- **SSR attribute `$.stringify` elide** (Svelte 5.55.9 `a5df6616e`, partial) — `eval_attr_expr_json` handles `ConditionalExpression` and string-concat `BinaryExpression`. Class, style-directive, and class-attribute (no-directive) emission paths route through it; the no-class-directive path also falls back to a static `class="..."` attribute when every interpolation inlines. Unblocked `attribute-dynamic-multiple`, `globals-not-overwritten-by-bindings`, `attribute-parts`, `head-raw-elements-content`, `innerhtml-interpolated-literal`. Multi-line `let` extraction remains pending.
- **ASI-aware side-effect import detection** (Svelte 5.55.2 cluster) — `extract_imports` in `crates/rsvelte_core/src/compiler/phases/3_transform/{client/mod.rs,server/helpers.rs}` now recognises `import "module"` / `import 'module'` (no `from`, no `;`) as a complete one-line side-effect import via `is_complete_side_effect_import`. Previously the line-by-line splitter only treated an import as complete when it contained `;` or matched `... from "…"`, so the side-effect form merged into the next statement (e.g. `let count = 1;`), breaking legacy `$.mutable_source` lowering. Unblocked `flush-sync-each-block`.
- **Comments in element openers and `Root.comments`** (Svelte 5.53.0 `92e2fc120`) — `parse_attribute` in `1_parse/state/element.rs` consumes `// …` / `/* … */` between attributes and pushes a `JsComment` onto `Root.comments`. The JS parser pipeline (`parse_expression` / `parse_program`) also forwards every OXC-discovered comment via a per-thread sink. Legacy AST surfaces the same data as `_comments`. Unblocked `parser-modern/comment-in-tag`, `parser-modern/parens`, `parser-legacy/script-comment-only`.
- **CSS prune-edge-cases / `:where()` composition** (Svelte 5.53.7 `0965028d3`) — `is_descendant_selector_unused` walks chains of arbitrary depth (was 2-link only), so `main > article > div > section > span` is now pruned as unused when the DOM doesn't satisfy the chain. `format_simple_selector_with_scope` and the relative-selector loop now also treat standalone `:where(...)` like `:is(...)`, recursing into the inner SelectorList so `ul :where(li)` emits `ul.svelte-xxx :where(li:where(.svelte-xxx))` instead of `:where(.svelte-xxx):where(li)`. Unblocked `css/css-prune-edge-cases`.
- **Head-effect blocker threading** (Svelte 5.53.0 `582e4443d`) — `client/visitors/title_element.rs` now scans the title value + memo expressions against `state.blocker_map` and emits a `[$$promises[N], ...]` blockers array as the 4th arg of `$.deferred_template_effect(...)`. `server/build.rs::apply_async_wrapping` now recurses into `SvelteHead` / `TitleElement` bodies so reactive expressions inside `<svelte:head><title>` get wrapped in `$$renderer.async([$$promises[N]], ...)`. Unblocked `async-derived-title-update`.
- **`$inspect` empty-statement thunk after top-level `await`** (Svelte 5.53.13 `b472171de`) — `async_body.rs::build_thunk` now emits `() => void 0` for `Hole(...)` entries (previously a sparse-array elision `,,`) and the array writer treats every entry as a real thunk. A new local `unthunk_bare_call` helper collapses `() => name()` to `name` in `ExprSimple` thunks to match upstream's `b.thunk` → `unthunk` pipeline. Unblocked `async-inspect-build`.
- **Sync-statement grouping in async-body transform** (Svelte 5.54.1 `6b33dd2a1`) — `async_body.rs` now flushes runs of analyzer-sync statements after the first top-level `await` into a single `SyncBlock` entry so they share one `$$promises[N]` blocker index and a combined `() => { ... }` thunk (mirroring upstream's `flush_sync_group`). `transform_async_body_inner` collects per-entry `analyzer_has_await` and `group_sync_entries` merges adjacent non-await runs; `build_thunk` flattens each `SyncBlock` via `sync_block_body_lines`. `compute_blocker_map` applies the same grouping so blocker indices line up between Phase 2 and Phase 3. Unblocked `async-if-hydration`, `async-derived-with-effect-and-boundary`, `async-binding-after-await`, `async-transform-empty-statements`.
- **Per-const-tag `@const` blocker** (Svelte 5.55.3 `3937ec03b`, partial) — `3_transform/server/visitors/const_tag.rs` now emits an **expression-bodied** assignment thunk (`async () => x = (await $.save(rhs))()` / `() => x = rhs`) instead of upstream's now-replaced block-bodied form, matching the final HEAD shape (commit `0ed8c282f` re-split the blocker wait into a separate thunk). The server `ServerCodeGenerator` also carries a precomputed `top_level_blocker_map` (from `compute_blocker_map(raw_script)`) so the const-tag visitor can look up instance-level `$$promises[N]` blockers (e.g. `let d = $derived(await ...)`) and emit `() => $$promises[N]` wait thunks for `{@const … = d}` declarations. The client `add_const_declaration` gained the same fallback for `state.blocker_map`. Unblocked `runtime-runes/async-const`, `runtime-runes/async-const-wait`, `hydration/boundary-pending-attribute`, `snapshot/async-const`.
- **Latest-use blocker order + server `$state.eager` derived-skip** (Svelte 5.53.x, `async-eager-derived` fixture) — `3_transform/client/visitors/fragment.rs` no longer calls `indices.sort()` on the assembled blocker indices so the emitted `$$promises[…]` array preserves insertion order, matching upstream's `Memoizer.#blockers = new Set()` iteration order (`[$$promises[1], $$promises[0]]` for the fixture instead of the previous `[$$promises[0], $$promises[1]]`). On the server side, `3_transform/server/transform_script.rs::wrap_derived_reads_in_script_inner` now recognises `$state.eager(<arg>)` and emits its whole-call text unchanged so identifier wrapping does not touch the inner argument, mirroring upstream's server `CallExpression` visitor which returns `node.arguments[0]` for `$state.eager` without visiting it. The `expression_tag` visitor in `3_transform/server/visitors/expression_tag.rs` now runs `wrap_derived_reads` BEFORE `transform_rune_in_template_expr` so the eager wrapper is still visible when the derived wrap runs, then the rune transform unwraps `$state.eager(...)` leaving the bare identifier intact (`derivedCount !== derivedCount()`). Unblocked `runtime-runes/async-eager-derived`.
- **`{#await await ...}` async-batching** (Svelte 5.55.9 `000c594e0`) — `3_transform/client/visitors/await_block.rs` now wraps the `$.await(...)` call in `$.async(node, [], [], (node) => $.await(...))` (empty blockers array) when `node.metadata.expression.has_await`, matching upstream's `has_blockers() || has_await` branch. The server visitor (`3_transform/server/visitors/await_block.rs`) IIFE-wraps the promise as `(async () => <expr>)()` so the await is not eagerly executed during SSR, and `bridge.rs::convert_await_block` / `build.rs::OutputPart::AwaitBlock` arm wrap the whole `$.await(...)` call in `$$renderer.child_block(async ($$renderer) => { ... })` so the SSR/hydration markup matches the client `$.async(...)` wrapper. `OutputPart::AwaitBlock` gained a `has_await: bool` field threaded from the visitor. Unblocked `runtime-runes/async-await`. `async-await-block-2` and `async-duplicate-dependencies` remain blocked on orthogonal axes (`$derived(await ...)` → `(await $.save($.async_derived(...)))()` lowering; `wrap_derived_reads` shadowing on `then` block argument identifiers; `{await expr}` text-expression `$.save(...)` predicate inside `async () => ...` server contexts).
- **SSR `$.save` parent-walk predicate** (Svelte 5.54.1 / 5.55.1 / 5.55.2 / mislabelled 5.53.4 — covers upstream's `AwaitExpression.js` walk) — `3_transform/server/visitors/expression_tag.rs` was wrapping any await with `(await $.save(...))()` whenever `self.in_block_body` was `false`, but the default at the top of the component was `false` too, so awaits inside the root component fragment got an unwanted `$.save(...)` wrap. Upstream's `AwaitExpression.js` server visitor instead walks `context.path` and only applies `save` when the first metadata-bearing ancestor is **not** a Fragment or ExpressionTag — i.e. when the immediate template parent is a `RegularElement` / `TitleElement` (the visitors that use `process_children` inline). Mirroring that, `in_block_body` now defaults to `true` (no save) and `RegularElement` / `TitleElement` / `select` / `textarea` / `<option>` toggle it `false` for their direct children iteration via save/restore. Every Fragment-bodied parent (root component fragment, IfBlock / EachBlock / KeyBlock / SnippetBlock / AwaitBlock body, SvelteHead, SvelteElement, SvelteBoundary, Component slot) leaves the flag at `true` so awaits in those bodies fall through to plain `await expr` — the surrounding `child_block(async ...)` already wraps them. The existing explicit `in_block_body = true` in `if_block.rs` / `each_block.rs` / `svelte_boundary.rs` is preserved because, after element children toggle the flag `false`, block visitors nested inside an element must re-toggle it back to `true` for their own body. Unblocked `runtime-runes/async-derived-indirect`, `runtime-runes/async-later-sync-overlaps`, `runtime-runes/async-overlap-multiple-1..4`, `runtime-runes/async-if-block-unskip`, `runtime-runes/async-if-else`.
- **Transitive `touch`-through-`binding.assignments`** (Svelte 5.55.1, `async-overlap-multiple-5..7`) — `3_transform/shared/async_body.rs::compute_blocker_map` and `update_blocker_map_for_stmt` now walk a new `collect_var_init_map` (binding name → init source for plain `let/var/const` declarators, excluding function-valued bindings already covered by `collect_function_bodies`) so a later async statement that references binding `b` also pulls in the identifiers from `b`'s initializer. Implemented as `apply_blocker_with_transitive(source, var_init_map, all_declared_vars, blocker_map, idx)`, which BFS-walks identifiers in `source`, upgrades each instance-scope binding's blocker index to `idx` (when higher), and queues every identifier from its init. Mirrors upstream's `calculate_blockers` → `touch(call)` → `for (const assignment of binding.assignments) touch(assignment.value, …)` recursion in `2-analyze/index.js`. The chained `let b = $derived(await delay(a*2)); let d = $derived(await delay(b + c))` pattern now collapses `a`/`b`/`c`/`d` to the chained derived's index, matching upstream's `[$$promises[2]]` blockers array (was `[$$promises[0], $$promises[2]]`). Unblocked `runtime-runes/async-overlap-multiple-5..7`.

### Ecosystem port

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 245/245 (100%), wired into compatibility report |
| 2 | svelte-check | ✅ v1.0 — walker + overlay + tsgo + incremental cache (incl. per-file warning cache at `<cacheDir>/warnings.json`) + watch + parallel compile + hires svelte2tsx source maps + SvelteKit kit-file `addedCode` augmentation for both `.ts` (TS annotations) and `.js` (JSDoc) files. `svelte.config.js` `kit.files` overrides are statically parsed and applied. Diagnostic-relevant `compilerOptions` (`experimental.async`, `runes`) are also statically read from `svelte.config.{js,cjs,mjs,ts,mts}` **and** the `vite.config.{js,ts,…}` Svelte-plugin call (`svelte({ compilerOptions })`, vite-plugin precedence over svelte.config), threaded into the per-file compile so e.g. top-level `await` no longer mis-fires `experimental_async` (issue #1034); the `--incremental` warnings cache carries a `config_signature` and drops on any option change (`svelte_check/config.rs`). Each / await (no-pending) / key / await-with-pending template wrappers preserve the expression chunk; each-block context bindings relocate via `MagicString::move_range` to keep destructure-pattern columns. Element-opener attribute bake is now structured (`Seg::Lit`/`Seg::Src`) so every attribute / `on:` / `class:` / `style:` / spread / `@attach` expression survives as an unedited MagicString chunk — column-accurate TS diagnostics on `<Component a={x} />`. |
| 3 | vite-plugin-svelte NAPI shim | 🟢 v1.0 — Rust-side `hmr_diff` + `resolve_id` + `preprocess` NAPI bindings + `@rsvelte/vite-plugin-svelte` JS shim **vendored as a workspace package at `apps/npm/vite-plugin-svelte`** (a fork of `@sveltejs/vite-plugin-svelte` whose compiler calls route through the NAPI bindings; published by the normal changeset Release flow like every other `apps/npm/*` package). Every Vite `transform` / `hotUpdate` / preprocess call routes through the NAPI bindings. `pnpm run test:vps` (shim + fixture; 15 assertions) covers the surface end-to-end after `pnpm run build:vps-native`. Supports Vite 6/7/8. SvelteKit HMR-latency bench is the one remaining open item. |
| 4 | svelte-language-server | ⛔ Deferred — CLI-side type checking is fully covered by `svelte-check` (Wave 2). LSP (editor hover/completion) waits on tsgo `tsserver` mode upstream. |

`migrate` (Svelte 4→5 migrator) remains intentionally out of scope.

## Implementation Status

### Fully passing in compatibility report

**Parser** - All Svelte 5 syntax, script/style parsing, legacy AST conversion
**Phase 2 Analyze** - Scope analysis, rune detection, store subscriptions, async blockers
**Phase 3 Transform** - Client/server code generation including async infrastructure
**CSS** - Selector scoping, combinators, pseudo-classes, `:global()`, keyframe prefixing
**Validator** - Warning/error detection including A11y
**Compiler Errors** - Error detection patterns
**Print** - `crates/rsvelte_core/src/compiler/print/` provides AST-to-source conversion (40/40 fixtures).
**Preprocess** - `crates/rsvelte_core/src/compiler/preprocess/` provides the markup/script/style preprocessor pipeline (19/19 fixtures). Each fixture's `_config.js` JS preprocessor is hand-ported into Rust closures in `crates/rsvelte_core/tests/common/preprocess_fixtures.rs`.

### Out of scope

**Migrate** — Svelte 4 → 5 migrator. rsvelte is a port of the Svelte 5 compiler, not a migration tool, so the 76 `migrate` fixtures are intentionally not implemented and the category is reported as skipped (out of scope) rather than as an implementation gap. Do not start work on this without an explicit scope change.

### Not implemented

**Sourcemaps** - No fixtures collected yet.

## Quick Reference

### Adding Features

1. Check `submodules/svelte/packages/svelte/src/compiler/phases/{phase}/` for the reference implementation (requires `git submodule update --init`)
2. Implement in the corresponding Rust module under `crates/rsvelte_core/src/compiler/phases/`
3. Run tests: `cargo test`
4. Debug differences with `node scripts/diff/compare-parsers.mjs`

### Documentation Updates

```bash
pnpm run test-and-update  # Updates README.md and docs dashboard
```

### Compatibility Report

Default output path: `fixtures/{svelte-short-commit}/compatibility-report.json` (created on first run; the `fixtures/` directory is generated, not checked in). Override with `node scripts/dev/update-docs.mjs --report <path>`.

Tracks test results over time for progress monitoring.
