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
#1974 (fixed by #1988), #1975 (fixed by #1993). Every remaining entry was found
by the checked-in pattern corpus (#2019) — the first three divergences it
surfaced.

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

## Server (`known-failures.server.json`, 3 entries)

### S1 — block-local snippet rendered through the dynamic path (1) (#2031)

`pattern/matrix/snippet-hoist/attach-component-scope-in-if.svelte`, the SSR half
of C1 above: rsvelte pushes the dynamic form's extra `<!---->` where upstream
emits the `{#if}` alternate directly. Same fix.

### S2 — computed / quoted key dropped in a destructured `$derived` (1) (#2033)

`pattern/issues/2001-derived-computed-key.svelte`. #2001 was fixed for the
client path only (#2010); the SSR path emits `c = $.derived(() => obj)` where
upstream emits `obj[k]` — the key access is dropped, so `c` is silently the
whole base object. The client target of the same file passes, so the fix is to
mirror `rune_transforms::derived_prop_access`'s key quoting into the server
transform.

### S3 — `$.to_array` arity with a rest element (1) (#2034)

`pattern/issues/2014-derived-array-rest-arity.svelte`. Same shape: #2014 was
fixed for the client only. SSR still emits `$.to_array(obj, 1)` where upstream
omits the length entirely for a pattern ending in a `RestElement`, so the
iterable is truncated (`b === []` instead of the remaining items) and SSR
disagrees with CSR — a hydration-mismatch source.

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
