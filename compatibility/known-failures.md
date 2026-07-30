# known-failures.{client,server}.json — why each entry is accepted

The output-equality corpus compiles every source with both the official Svelte
compiler and rsvelte (CSR + SSR) and requires byte-identical output after
comparison-side normalization. The comparison is **AST-structural**
(`normalize.astEquivalent` via acorn): comment position, `${}` line-wrapping,
redundant parens, and quote style are already absorbed, so any entry here is a
**genuine structural (AST-distinct) divergence** in the generated code, not a
cosmetic one.

The ratchet (`corpus-compat.yml`) fails only on an `(id, target)` pair not in the
baseline — the lists may only shrink, never grow. Each accepted entry must be
justified in this file.

## Client (`known-failures.client.json`, 5 entries)

All five are the seed set from enrolling `submodules/skeleton` in the corpus
(#1924, ~700 new sources). Each was reduced to a standalone minimal repro (not
inferred from the corpus diff) and grouped below; none is a regression of
previously-passing code.

### C1 — object-pattern property split on a ternary default (1) (#1973)

`skeleton/packages/skeleton-svelte/src/components/portal/anatomy/root.svelte`.
A destructured `$derived()` whose pattern carries a `ConditionalExpression`
default — `const { a, b = q ? 1 : 2 } = $derived(props)` — is lowered by
splitting the pattern property on its first `:`, so the ternary's alternate
becomes the declaration id and rsvelte emits **syntactically invalid JS**
(`2 = $.derived(() => $$props.b = q ? 1)`; upstream emits
`b = $.derived(() => $.fallback($$props.b, () => q ? 1 : 2, true))`). Invalid
output is also why the entry's diff shows quote-style noise: oxfmt cannot parse
the file, so normalization leaves both sides unformatted. Fix belongs in
rsvelte's destructured-`$derived` fallback lowering (nesting-aware property
split + the lazy `$.fallback(…, true)` form).

### C2 — `{@render}` argument memo ignores legacy mode (3) (#1974)

`skeleton/playgrounds/skeleton-svelte/src/routes/components/tree-view/+page.svelte`
and the two `sites/skeleton.dev/.../tree-view/svelte/{default,multiple-selection}.svelte`
examples. In a **non-runes** component, a `{@render snippet(x, [...a, i])}`
argument memo must be `$.derived_safe_equal` (upstream `RenderTag.js`:
`memoizer.deriveds(context.state.analysis.runes)`); rsvelte's
`3_transform/client/visitors/render_tag.rs` hardcodes `$.derived`. Repro: a
component using `export let` (legacy) plus a self-recursive snippet whose
argument is an array literal. Fix belongs in rsvelte — thread
`analysis.runes` into that call site.

### C3 — whitespace run collapsed around removed comments when nested (1) (#1975)

`skeleton/sites/plus.skeleton.dev/src/routes/(app)/+page.svelte`. Two adjacent
HTML comments between element siblings leave **two** spaces in the official
template (`</header>  <button`) but one in rsvelte's. It only reproduces when
the comments' parent is itself nested (an `outer > div > header … comments …
button` shape); the same markup as the fragment's root element matches. Fix
belongs in rsvelte's template whitespace handling for comment-only runs.

## Server (`known-failures.server.json`, 0 entries)

No accepted server-side divergences remain.

## Hard-cluster warnings for future work

Deep areas where past fixes caused wide regressions (mirror upstream exactly;
verify against the full corpus + byte-exact runtime/ssr/css suites before
landing):

- **scope.evaluate `is_defined` / `should_proxy` lattice** — widening it to drop a
  spurious `?? ''` or proxy regresses real props that need `?? ''`. svelte resolves
  via scope; a name-keyed approximation cannot represent per-site outcomes — use
  per-site (Semantic / scope-chain) resolution.
- **each-item reactivity wrapping** (function-depth `has_external_dependencies`
  check) — a prior attempt caused ~498 regressions.
- **`$derived` currying** (`yScale()(tick)`) — reverted twice; do not retry naively.
- **store/runes name-conflict resolution** — two independent sub-bugs that must land
  together and distinguish getter-vs-user-call by context.
- **CSS structural prune** (`is_structural_descendant_chain_unused`) bails on
  snippet-declared elements, `<selectedcontent>`, `:host`/`:root`/`:global`,
  functional pseudo-classes, and escaped identifiers — extend only with the
  matching upstream semantics.
