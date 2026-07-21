# known-failures.{client,server}.json — why each entry is accepted

The output-equality corpus compiles every source with both the official Svelte
compiler and rsvelte (CSR + SSR) and requires byte-identical output after
comparison-side normalization. The comparison is **AST-structural**
(`normalize.astEquivalent` via acorn): comment position, `${}` line-wrapping,
redundant parens, and quote style are already absorbed, so every entry below is a
**genuine structural (AST-distinct) divergence** in the generated code, not a
cosmetic one.

The ratchet (`corpus-compat.yml`) fails only on an `(id, target)` pair not in the
baseline — the lists may only shrink, never grow. Each entry is an isolated, deep
compiler-behaviour gap; attempts to fix them are regression-prone against the
8000+ passing entries (several have been reverted after wide blowups), so they are
accepted until an upstream-faithful port lands.

## Client (`known-failures.client.json`, 5 entries)

- **`melt-ui/.../SpatialMenuNavTest.svelte`** — two causes: (a) a proxy argument in
  `$.set(highlighted, id, true)` where `id` is an inner-scope TemplateLiteral const
  not admitted to `non_proxy_vars` (the `name_occurrences==1` heuristic bails on
  multi-occurrence names); (b) `${cols ?? ''}` — svelte keeps the `?? ''`, rsvelte
  elides it (scope.evaluate treats a prop member as defined where svelte keeps it
  UNKNOWN).
- **`svelte-form-builder/.../PropertyPanelChoiceCheckboxRadioSpecific.svelte`** —
  reactive assignment lowered to a SequenceExpression (`(field(...), true), ...`)
  vs a bare CallExpression (~114-node difference).
- **`svelte-sonner/.../Toaster.svelte`** — JS now matches; remaining divergence is
  **CSS unused-selector pruning**: svelte prunes selectors like
  `[data-sonner-toast][data-styled='true'] [data-description]` as unused while
  rsvelte keeps them. Caused by child-component elements + `{...restProps}` spread
  over-matching (`attribute_matches` returns true on any spread). High CSS-fixture
  regression risk.
- **`svelte-table/example/Example2.svelte`** — `?? ''` wrongly added to a
  `${cond ? … : ""}` whose branches are all strings; a legacy `let iconAsc = "↑"`
  (string-literal init) is not treated as defined.
- **`svelte-table/src/SvelteTable.svelte`** — two `$.get(col)` reads for each-item
  `col` missing inside `$.invalidate_inner_signals` (from a `bind:value` key
  `filterSelections()[col.key]`). The exact condition making `col` reactive is
  unresolved.

## Server (`known-failures.server.json`, 0 entries)

No accepted server-side divergences remain.

## General hard-cluster root causes (why fixes are deferred)

Recurring deep clusters behind these entries (mirror upstream exactly; verify
against the full corpus + byte-exact runtime/ssr/css suites before landing):

- **scope.evaluate `is_defined` / `should_proxy` lattice** — widening it to drop a
  spurious `?? ''` or proxy regresses real props that need `?? ''`. svelte resolves
  via scope; rsvelte's text/heuristic approximation is looser.
- **CSS over-scoping / unused-selector pruning** with `{...spread}` and child
  components — regression-prone against the 181 CSS fixtures.
- **each-item reactivity wrapping** (function-depth `has_external_dependencies`
  check) — a prior attempt caused ~498 regressions.
- **`$derived` currying** (`yScale()(tick)`) — reverted twice; do not retry naively.
- **store/runes name-conflict resolution** — two independent sub-bugs that must land
  together and distinguish getter-vs-user-call by context.
