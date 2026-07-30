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

The five skeleton seeds from #1924 are gone (#2017): #1973 (fixed by #1996),
#1974 (fixed by #1988), #1975 (fixed by #1993). Of the three divergences the
checked-in pattern corpus (#2019) surfaced, the two SSR destructuring ones
(#2033, #2034) are gone too (fixed by #2036); the remaining entry is #2031.

## Client (`known-failures.client.json`, 1 entry)

### C1 — block-local snippet rendered through the dynamic path (1) (#2031)

`pattern/matrix/snippet-hoist/attach-component-scope-in-if.svelte`. A
`{#snippet}` declared inside an `{#if}` block and `{@render}`ed as a sibling in
that same block is lowered as a *dynamic* render tag: the client allocates a
comment anchor (`var fragment_1 = $.comment()`) where upstream resolves the
snippet statically and calls it directly (`row($$anchor)`). Sibling patterns in
the same matrix directory pass — the same snippet at the fragment root
(hoistable and non-hoistable) and inside `<svelte:boundary>` — so the trigger is
the snippet binding living in a *block* fragment, most likely in the
non-hoisted-snippet path added by #1990. Fix belongs in rsvelte's `{@render}`
visitor (resolve block-local snippet bindings statically, as upstream does).

## Server (`known-failures.server.json`, 1 entry)

### S1 — block-local snippet rendered through the dynamic path (1) (#2031)

`pattern/matrix/snippet-hoist/attach-component-scope-in-if.svelte`, the SSR half
of C1 above: rsvelte pushes the dynamic form's extra `<!---->` where upstream
emits the `{#if}` alternate directly. Same fix.

The two SSR destructuring seeds this corpus also surfaced — #2033 (computed /
quoted key dropped in a destructured `$derived`) and #2034 (`$.to_array` arity
with a rest element) — were resolved by #2036, which mirrored #2010's client
destructuring fixes onto the server target.

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
