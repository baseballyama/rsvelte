# Remaining skipped fixtures

Live status: re-run `pnpm run compatibility-report` and audit with
`cargo test --release --test audit_skipped -- --nocapture`. The skip
lists live in `tests/compatibility_report.rs` (the `runtime_skip_tests`
array + per-category `skip_*` arrays), `tests/runtime.rs`, `tests/ssr.rs`,
`tests/print.rs`, and `tests/parser_fixtures.rs`.

Current count: **52 in-scope skipped fixtures** (the 76 `migrate` fixtures
are intentionally out of scope and not counted here). Every executed
in-scope fixture passes (3424/3424).

Each cluster below lists the upstream commit, the rsvelte gap it exposes,
the fixtures it blocks, and a rough difficulty estimate. Land them one
cluster per PR — the audit binary shows you which fixtures flip from
"STILL FAILING" to "NOW PASSING" so you can keep skip-list edits scoped.

---

## 1. async-blocker / `@const` cluster (43 fixtures, **multi-day**)

The single largest pile. Spans Svelte 5.53.0 → 5.55.9 and touches the
client async transform end-to-end.

### What needs to change

| Sub-cluster | Upstream commit | rsvelte gap |
|---|---|---|
| `async-derived-title-update` (5.53.0 `582e4443d`) | "ensure head effects are kept in the effect tree" | Thread the component's `$$promises` array through `$.deferred_template_effect` inside `$.head(...)` and the sibling `$.template_effect`. rsvelte never wires the async-derived `$$promises` ref through head effects. |
| `async-eager-derived` (5.53.12 `965f2a0ac`) | "fix: handle async RHS in assignment_value_stale" | Reorder the `$$promises[…]` blockers array to latest-use order instead of declaration order. 1-line diff but the ordering walker must change. |
| `async-inspect-build` (5.53.13/5.54.0 `b472171de`) | "ensure `$inspect` after top level await doesn't break builds" | Emit `$.run([test, () => void 0])` ordering after a top-level await — rsvelte's inspect-build pipeline doesn't produce it. |
| 5.54.1 cluster — `async-derived-indirect`, `async-if-hydration`, `async-derived-with-effect-and-boundary`, `async-binding-after-await`, `async-transform-empty-statements`, `async-later-sync-overlaps`, `async-style-after-await` (7 fixtures) | `6b33dd2a1` "fix: group sync statements" | When multiple sync assignments share the same blocker set, group them into a single thunk callback (`() => { color = 'red'; width = $.state(...); }`) and reuse the same `$$promises[N]` blocker index. rsvelte still emits one callback per statement with sequential indices. |
| `async-overlap-multiple-1..7` (5.55.1 `5e8662fb2`, 7 fixtures) | "chore: lots of async tests" | Hoisted-function blank-line placement diverges + SSR emits `(await $.save(delay(x)))()` instead of `await delay(x)` for top-level template `await`. The trivial fix `has_save: false` regresses ~9 unrelated fixtures, so the predicate needs to be context-aware. |
| `async-if-block-unskip` (5.55.2 `8966601dc` / `edcbb0e64`) | "handle parens" + "invalidate `@const` tags based on visible references" | Same blank-line placement + the `$.save` issue. |
| 5.55.3 `@const` cluster — `async-const`, `async-const-wait`, `async-derived-const-blocker`, `async-reactivity-loss-no-false-positive-1..3`, `async-reactivity-loss-async-after-sync` (7 fixtures) | `3937ec03b` "fix: correctly calculate `@const` blockers" | Group `@const` assignments under the same group-sync-statements batching as 5.54.1. |
| 5.55.4 `@const` context — `async-effect-pending-eager`, `async-context-after-await-const` (2 fixtures) | `0ed8c282f` "fix: reset context after waiting on blockers of @const expressions" | Reset reactive context after the blocker await of an `@const` expression so subsequent code sees the right scope. |
| 5.55.6 cluster — `async-flushsync-in-effect`, `async-stale-derived-4`, `async-eager-block`, `async-eager-each-block`, `async-dont-rebase-new-batch-1..4`, `async-debug-awaited-expression`, `async-state-updates-microtask-separated`, `dynamic-component-member` (11 fixtures) | `e00944ffd` / `89b6a939f` / `4c96b469f` / `69b4c9f56` | Same sync-grouping/`Promise.all`-save follow-up + `<svelte:component this={state.x.Y}>` needs `$.get(state)` wrapping in SSR/client. |
| 5.55.9 cluster — `async-await-block-2`, `async-await`, `async-duplicate-dependencies` (3 fixtures) | `000c594e0` "fix: `{#await await ...}` and async dependencies fixes" | Refine async-batching / await-merge codegen for `{#await await ...}`. |
| 5.53.4 cluster — `async-boundary-nav-race`, `async-if-else` (2 fixtures) | `3a289797b` "fix: handle default parameters scope leaks" | Async-boundary blocker plumbing depends on the function-scope porosity fix below. |

### Plan

1. Decide the data model: where does the per-statement blocker index live
   today and how does upstream group statements? Read the upstream commit
   diffs in order (5.54.1 → 5.54.x → 5.55.3 → 5.55.4 → 5.55.6 → 5.55.9)
   before touching any rsvelte file.
2. Port the sync-statement grouping (5.54.1) first — unblocks 7 fixtures
   in one go.
3. Then `@const` blocker (5.55.3+) — depends on grouping.
4. Then `Promise.all`-save reshape (5.55.6) — depends on @const blocker.
5. The `$.save` SSR predicate and `<svelte:component>` get-wrap can land
   as small follow-ups in any order.

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

## 4. CSS prune-edge-cases (1 fixture, **CSS pruning**)

`css/css-prune-edge-cases`. Upstream commit `0965028d3` "perf: optimize
CSS selector pruning" (Svelte 5.53.7).

Two known divergences:

1. A deep `main > article > div > section > span` chain that upstream
   prunes as unused stays in our CSS output.
2. `:where(li:where(.hash))` is emitted as `:where(.hash):where(li)` —
   the selector composition order doesn't match upstream.

Fix lives in `src/compiler/phases/3_transform/.../css` selector pruning
and composition. Walking the fixture's tests with `--release` is fast
(under 1s), so iterate locally before pushing.

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
