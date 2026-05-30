# Remaining skipped fixtures

Live status: re-run `pnpm run compatibility-report` and audit with
`cargo test --release --test audit_skipped -- --nocapture`. The skip
lists live in `tests/compatibility_report.rs` (the `runtime_skip_tests`
array + per-category `skip_*` arrays), `tests/runtime.rs`, `tests/ssr.rs`,
`tests/print.rs`, and `tests/parser_fixtures.rs`.

Current count: **39 in-scope skipped fixtures** (the 76 `migrate` fixtures
are intentionally out of scope and not counted here). Every executed
in-scope fixture passes.

Each cluster below lists the upstream commit, the rsvelte gap it exposes,
the fixtures it blocks, and a rough difficulty estimate. Land them one
cluster per PR — the audit binary shows you which fixtures flip from
"STILL FAILING" to "NOW PASSING" so you can keep skip-list edits scoped.

---

## 1. async-blocker / `@const` cluster (38 fixtures, **multi-day**)

The single largest pile. Spans Svelte 5.53.0 → 5.55.9 and touches the
client async transform end-to-end.

### What needs to change

| Sub-cluster                                                                                                                               | Upstream commit                                                                                                                       | rsvelte gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~`async-eager-derived`~~ (5.53.12 `965f2a0ac`, **landed**)                                                                               | "fix: handle async RHS in assignment_value_stale"                                                                                     | ✅ Drop the `indices.sort()` call in `3_transform/client/visitors/fragment.rs` so the `$$promises[…]` blockers array preserves insertion order (matching upstream's `Memoizer.#blockers = new Set()` latest-use order). Also teach `wrap_derived_reads_in_script_inner` in `3_transform/server/transform_script.rs` to skip identifier-wrapping inside `$state.eager(<arg>)` (and swap the order with `transform_template_rune_ast` in `server/visitors/expression_tag.rs` so the rune-unwrap runs after the derived wrap), mirroring upstream's server `CallExpression` visitor which returns `node.arguments[0]` for `$state.eager` without visiting it. Unblocked `runtime-runes/async-eager-derived`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ~~5.54.1 cluster~~ (0 fixtures remaining)                                                                                                 | `6b33dd2a1` "fix: group sync statements"                                                                                              | ✅ Sync-statement grouping ported (`SyncBlock(Vec<AsyncStmt>)` in `transform_async_body_inner`; mirrored in `compute_blocker_map`). Unblocked `async-if-hydration`, `async-derived-with-effect-and-boundary`, `async-binding-after-await`, `async-transform-empty-statements`. ✅ SSR `$.save` parent-walk predicate ported (`in_block_body` now defaults to `true`, toggled `false` only by element-like visitors — `RegularElement` / `TitleElement` / `select` / `textarea` / `<option>`). Unblocked `async-derived-indirect`, `async-later-sync-overlaps`. ✅ `async-style-after-await` unblocked by per-slot **primary** binding tracking in `compute_blocker_primary_names` (3_transform/shared/async_body.rs) + matching dedup-by-primary-name logic in `client/visitors/fragment.rs` template_effect blocker emission: this mirrors upstream's `Memoizer.#blockers = new Set<Expression>` (each declarator owns its own `binding.blocker` Expression) so two distinct declarators sharing one sync group both contribute their own array entry (`[$$promises[1], $$promises[1]]`), while pre-await sync state referenced from an async-slot expression doesn't inflate the count (`async-pending-batch`, `async-eager-derived` stay correct).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ~~`async-overlap-multiple-1..4`~~ (5.55.1 `5e8662fb2`, **landed**) / `async-overlap-multiple-5..7` (3 fixtures remaining; client-side)    | "chore: lots of async tests"                                                                                                          | ✅ SSR `$.save` parent-walk predicate ported (see above row). Unblocked `async-overlap-multiple-1..4`. `-5..7` use `let b = $derived(await delay(...))` in the instance script and hit a separate async-blocker cluster (client-side failure).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ~~`async-if-block-unskip`~~ (5.55.2 `8966601dc` / `edcbb0e64`, **landed**)                                                                | "handle parens" + "invalidate `@const` tags based on visible references"                                                              | ✅ SSR `$.save` parent-walk predicate ported (see above row). Unblocked `async-if-block-unskip`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 5.55.3 `@const` cluster — `async-reactivity-loss-no-false-positive-1..3`, `async-reactivity-loss-async-after-sync` (4 fixtures remaining) | `3937ec03b` "fix: correctly calculate `@const` blockers"                                                                              | ✅ Per-const-tag blocker port landed: `3_transform/server/visitors/const_tag.rs` now emits expression-bodied assignment thunks (`async () => x = (await $.save(rhs))()` / `() => x = rhs`) and the server `ServerCodeGenerator.top_level_blocker_map` lets the const-tag visitor look up instance-level `$$promises[N]` blockers (e.g. `let d = $derived(await ...)`). Client `add_const_declaration` got the same `state.blocker_map` fallback. ✅ `has_more_blockers_than` flattening guard ported on both client (`3_transform/client/visitors/if_block.rs::collect_branches` now compares blocker-expression sets per branch and bails out of flattening when an `{:else if}` introduces blockers the outer test doesn't share) and server (`3_transform/server/visitors/if_block.rs::generate_if_branch_body` takes a `parent_blockers` argument computed from `top_level_blocker_map` + `const_blocker_map` and falls through to standard child-node processing when blockers differ; post-process rewrites the resulting top-level IfBlock's `is_elseif` to `false` so the codegen flattener doesn't re-flatten). ✅ `apply_const_async_wrapping` (server `build.rs`) now recurses into `OutputPart::AsyncBlock` inner content so const-tag blockers declared inside an instance-level `async_block([$$promises[N]], ...)` wrapper (e.g. `{@const}` inside `{#if d}` where `d` has an instance blocker) still get wrapped in `async_block([promises[M]], ...)`. Unblocked `runtime-runes/async-const`, `runtime-runes/async-const-wait`, `runtime-runes/async-derived-const-blocker`, `hydration/boundary-pending-attribute`, `snapshot/async-const`. The remaining fixtures fail on orthogonal axes (reactivity-loss context tracking — tracked under the 5.55.4 row below). |
| 5.55.4 `@const` context (0 fixtures remaining)                                                                                            | `0ed8c282f` "fix: reset context after waiting on blockers of @const expressions" + `273f1a85a` "fix: keep flushing new eager effects" | ✅ Const-async wrapping in component wrapper path landed (`0ed8c282f`): `apply_const_async_wrapping` now runs in the `$$renderer.component(...)` wrapper branch of `3_transform/server/build.rs::build_program` (in addition to the existing call in `build()`), so `{@const foo = bar}` references — where `bar` is a top-level `$$promises[N]` blocker — correctly wrap dependent text expressions in `$$renderer.async([promises[M]], ($$renderer) => $$renderer.push(() => $.escape(foo)))`. Unblocked `runtime-runes/async-context-after-await-const`. ✅ `async-effect-pending-eager` (added in upstream `273f1a85a`) unblocked: the upstream runtime fix is in `batch.js` (reorders the `eager_versions = []` clear so `flushSync`-driven additions during eager flush survive) and not applicable to rsvelte, but the same fixture exercises a _compile-time_ gap rsvelte still had — `{#if $effect.pending() > 0}` test expressions weren't being routed through the SSR rune-call rewrite. Server `IfBlock` visitor (`3_transform/server/visitors/if_block.rs`) now calls `transform_rune_in_template_expr` over `block.test` (and over nested else-if test expressions) before emitting, mirroring upstream's per-`CallExpression` visitor that fires recursively when the `IfBlock` visitor visits `node.test`. The `<p>...</p>` trailing-whitespace concern turned out to be a non-issue — every remaining diff is pure indentation that OXC canonicalization absorbs (`MATCH`).                                                                                                                                                                                                                                                                                        |
| ~~5.55.6 cluster~~ (0 fixtures remaining)                                                                                                 | `e00944ffd` / `89b6a939f` / `4c96b469f` / `69b4c9f56`                                                                                 | ✅ `dynamic-component-member` (5.55.6 `e00944ffd`), `async-eager-each-block` already landed earlier; `async-flushsync-in-effect` + `async-stale-derived-4` were never blocked compile-time (whitespace-only diffs absorbed by canonicalization). Newly landed: `@debug` blocker plumbing (Svelte 5.55.6 `4c96b469f`) on both client (`debug_tag.rs` → `template_effect(callback, [], [], blockers)` overload reading `state.blocker_map` + `state.const_blocker_map`) and server (`mod.rs::generate_debug_tag` → `$$renderer.async_block([blockers], ...)` wrap). Also mirrored upstream `clean_nodes`'s second pass in the server if-block body (`if_block.rs::generate_if_branch_body`): drop interior `Comment` nodes (unless `preserve_comments`), then for each `Text` mutate its leading/trailing whitespace runs to a single space unless the adjacent sibling is an `ExpressionTag`, then drop nodes whose data is now empty. Without this, two `{expr}` separated by `\n\t<!--…-->\n\t` would bake two literal spaces into the output template literal. Unblocked `async-debug-awaited-expression`, `async-dont-rebase-new-batch-1`, `async-dont-rebase-new-batch-3`, `async-dont-rebase-new-batch-4`, `async-state-updates-microtask-separated`, and `async-eager-block`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5.55.9 cluster — `async-await-block-2`, `async-duplicate-dependencies` (2 fixtures remaining)                                             | `000c594e0` "fix: `{#await await ...}` and async dependencies fixes"                                                                  | ✅ `{#await await ...}` async-batching codegen ported (unblocked `runtime-runes/async-await`). The remaining two still fail on orthogonal axes — `$derived(await ...)` lowering needs `(await $.save($.async_derived(...)))()` wrapping, `wrap_derived_reads` over-applies to `then` block argument shadowing, and `{await expr}` text expressions emit a `$.save(...)` wrap on the server even in async-aware contexts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ~~`async-boundary-nav-race`~~ (0 fixtures remaining; **mislabelled 5.53.4**)                                                              | not `3a289797b` — see notes                                                                                                           | rsvelte already handles default-parameter scope leak correctly. ✅ SSR `$.save` parent-walk predicate ported (unblocked `async-if-else`). ✅ Snippet hoisting fix: `2_analyze/visitors/snippet_block.rs::check_hoistable` now handles `ConstTag` (checks RHS of each VariableDeclarator) and `SvelteBoundary`/`SvelteFragment`/`SvelteHead`/`SvelteBody`/`SvelteDocument`/`SvelteWindow`/`TitleElement`/`SlotElement` (recurses into attributes + fragment). Previously these template variants fell through the wildcard `_ => {}` arm, so a snippet body containing `<svelte:boundary>{@const _a = await gate('a')}…</svelte:boundary>` skipped the `gate` reference check and got marked `can_hoist=true`, lifting the snippet to module scope. Now the inner `gate('a')` is checked against `is_identifier_hoistable`, finds `gate`'s scope_index=1 binding (instance scope, not import), returns false, and the snippet stays inside `Main(...)` — matching upstream's `scope.references`-driven `can_hoist_snippet` walk.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### Plan

1. Decide the data model: where does the per-statement blocker index live
   today and how does upstream group statements? Read the upstream commit
   diffs in order (5.54.1 → 5.54.x → 5.55.3 → 5.55.4 → 5.55.6 → 5.55.9)
   before touching any rsvelte file.
2. Port the sync-statement grouping (5.54.1) first — unblocks 7 fixtures
   in one go.
3. Then `@const` blocker (5.55.3+) — depends on grouping.
4. Then `Promise.all`-save reshape (5.55.6) — depends on @const blocker.
5. ~~The `$.save` SSR predicate~~ (landed — see the 5.54.1 row above) and
   `<svelte:component>` get-wrap can land as small follow-ups in any order.

Audit driver (`tests/audit_skipped.rs`) lists each fixture's client/server
pass state — use it after each step to keep regressions out.

---

## 2. ~~flush-sync-each-block~~ (landed)

`runtime-legacy/flush-sync-each-block` now passes after teaching
`extract_imports` (client + server text-based hoisting) to recognise
single-line side-effect imports without a `;` terminator (e.g.
`import "./Inner.svelte"`). Previously the line-by-line splitter only
considered a one-line import complete when it contained a `;` or had
`... from "…"`/`'…'` — so the side-effect form fell into the multi-line
accumulator and merged the following statement into the import block.

The new helper `is_complete_side_effect_import` returns `true` when
`import ` is immediately followed by a closed string literal and only
whitespace until end-of-line. Any default / named / namespace import or
trailing tokens still take the existing code paths.

---

## 3. Comments-in-tags (✅ landed — 3 fixtures unblocked)

Landed: upstream commit `92e2fc120` "feat: allow comments in tags"
(Svelte 5.53.0) is now ported. The parser captures `//` and `/* */`
between element-opener attributes and surfaces them — along with all JS
parser comments — on `Root.comments` (modern AST) and `_comments`
(legacy AST). Newly passing fixtures: `parser-legacy/script-comment-only`,
`parser-modern/comment-in-tag`, `parser-modern/parens`.

`parser-legacy/javascript-comments` remains skipped (cluster 7, WONTFIX
— OXC drops standalone comment statements that acorn surfaces).

---

## 4. CSS prune-edge-cases ✅ landed

Was `css/css-prune-edge-cases`. Upstream commit `0965028d3` "perf:
optimize CSS selector pruning" (Svelte 5.53.7). Both divergences are now
fixed in `src/compiler/phases/3_transform/css.rs`:

1. `is_descendant_selector_unused` walks arbitrary-depth combinator
   chains (descendant + child) instead of only 2 links, so deep chains
   like `main > article > div > section > span` are pruned when the DOM
   doesn't satisfy them.
2. `format_simple_selector_with_scope` + the relative-selector emission
   loop now treat standalone `:where(...)` like `:is(...)`, recursing
   into the inner SelectorList so `ul :where(li)` becomes
   `ul.svelte-xxx :where(li:where(.svelte-xxx))` instead of
   `:where(.svelte-xxx):where(li)`.

---

## 5. `@keyframes` percentage / print fixture inconsistency (1 fixture)

`print/css-keyframes-percent`. **Likely WONTFIX-or-update-upstream.**

Upstream has two adjacent fixtures with inconsistent expectations for the
same situation (a `<style>`-only file):

- `print/samples/style/output.svelte` expects `\n\n<style>` (two leading
  blank lines).
- `print/samples/css-keyframes-percent/output.svelte` expects `<style>`
  (no leading blank lines).

Both inputs are `<style>...</style>\n`. The `style` fixture was generated
when the printer emitted leading `\n\n`; `css-keyframes-percent` (added
in `ca3f35bf7` for the percent double-print fix) was generated after the
behaviour changed but the `style` fixture was never refreshed.

Our printer currently matches `style` exactly. Removing the leading
blank lines flips `css-keyframes-percent` to passing but immediately
breaks `style`. Either:

- File an upstream issue to regenerate `style`'s expected output, then
  match the new (no-leading-blank) behaviour; or
- Wait for upstream to consolidate.

---

## 6. `validator/error-mode-warn` (1 fixture, **out-of-scope-ish**)

The fixture's own `_config.js` opts out with `skip: true`. We surface it
as `Skipped via _config.js` in the compatibility report. No rsvelte work
required — the skip is intentional on the upstream side.

---

## 7. svelte2tsx error fixtures (✅ landed)

`svelte2tsx/editing-mustache`, `svelte2tsx/unclosed-tag-containing-tag.v5`.

These ship `expected.error.json` (not `expected.tsx`). The fixture
runner in `tests/common/svelte2tsx.rs` now detects them, calls
`svelte2tsx`, and verifies the surfaced error's `{ start, end }`
positions match the expected JSON — mirroring upstream's Svelte 5
comparison strategy (see
`submodules/language-tools/packages/svelte2tsx/test/helpers.ts`).
To align with upstream's `js_parse_error(err.pos, …)` semantics,
`check_js_parse_error` was widened to also surface the OXC label
offset and `parse_js_expression_strict` now reports a point span
(`start == end`).

---

## 8. `parser-legacy/javascript-comments` (1 fixture, **OXC limitation**)

Long-standing acorn-vs-OXC comment-attachment mismatch. The expected
AST records standalone comment statements that OXC doesn't surface in
ESTree-compatible form (no `leadingComments` / `trailingComments` arrays
attached to nodes).

Likely **WONTFIX** unless OXC adds an opt-in comment-attachment mode.
Possible workaround: post-process the parsed program to inject comments
from a separate comments array — but it's intrusive and limited by what
OXC chooses to emit.

---

## Audit workflow

After landing any cluster:

```bash
# 1. Verify nothing regresses
cargo test --release --test runtime
cargo test --release --lib --test ssr --test compiler_fixtures
cargo clippy --release --tests -- -D warnings
cargo fmt --check

# 2. See what flipped
cargo test --release --test audit_skipped -- --nocapture

# 3. Refresh the compatibility report (CI also runs this)
pnpm run compatibility-report
pnpm run update-docs    # only when you want to push the dashboard

# 4. Drop the newly-passing fixtures from the skip lists in
#    tests/compatibility_report.rs and tests/runtime.rs (and ssr.rs /
#    print.rs / parser_fixtures.rs as appropriate)
```

PRs that touch shared test files frequently hit a transient
`Compatibility Report` CI failure with `multiple different versions of
crate rustc_hash` — re-run the failed job and it usually passes on the
second attempt.
