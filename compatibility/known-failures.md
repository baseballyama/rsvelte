# known-failures.{client,server,client-dev}.json — why each entry is accepted

The output-equality corpus compiles every source with both the official Svelte
compiler and rsvelte (CSR + SSR + CSR `dev: true`) and requires byte-identical output after
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

## Client dev (`known-failures.client-dev.json`, 4563 entries)

The `client-dev` target is the `client` target with `dev: true`. It is a
separate ratchet because `dev` gates 18 client codegen files plus the CSS
transform (`css/index.js:146` keeps empty rules in dev), so a dev-only
divergence is invisible to the two `dev: false` targets — #1981
(`<X.Y bind:…>`) was live in 524 corpus files and undetected for exactly that
reason. CSS is compared for this target too.

This baseline is the **enrolment seed**: it is what the corpus measured the
first time it ever compiled with `dev: true`, not a set of regressions. Apart
from the four `pattern/` entries that are also listed under C1 / S1–S3 above,
every entry diverges *only* on `client-dev`. The CSS comparison is already clean
— 0 css-mismatches, so the dev empty-rule branch of the CSS transform matches
upstream exactly.

The checked-in pattern corpus (#2019) contributed 11 of these entries. All 11
land in clusters that the real-world sources had already established, so the
matrices confirmed the clusters rather than adding root causes.

The entries are not independent bugs. Most are dev-only instrumentation helpers
that rsvelte's client codegen does not emit **at all** — each such cluster is a
single unported feature, and porting it drops the whole cluster at once. Counts
are entry counts attributed by the first differing line, so they are a lower
bound: an entry that diverges for two reasons is counted under whichever
surfaces first.

| Cluster | Entries | Missing dev instrumentation | Upstream emitter (`phases/3-transform/client/`) | Issue |
|---|---|---|---|---|
| CD1 | 1186 | `$.add_locations(...)` template location metadata + the `Comp[$.FILENAME]` it references | `transform-template/index.js` | #2020 |
| CD2 | 628 | `$.tag()` / `$.tag_proxy()` labelling of reactive sources | `visitors/VariableDeclaration.js`, `visitors/ConstTag.js` | #2021 |
| CD3 | 583 | `$.check_target(new.target)` instantiation guard | `transform-client.js` | #2022 |
| CD4 | 582 | `...$.legacy_api()` spread on legacy-mode components | `transform-client.js` | #2023 |
| CD5 | 532 | the dev-only third argument (component name) of `$.rest_props($$props, excludes, "Name")` | `transform-client.js`, `visitors/VariableDeclaration.js` | #2024 |
| CD6 | 327 | `$.strict_equals` / `$.equals` instrumented comparisons | `visitors/BinaryExpression.js` | #2025 |
| CD7 | 241 | `$.track_reactivity_loss(...)` around awaited expressions | `visitors/AwaitExpression.js`, `visitors/ForOfStatement.js` | #2026 |
| CD8 | 90 | `$.create_ownership_validator` + `$$ownership_validator.mutation(...)` | `transform-client.js`, `visitors/shared/{component,utils}.js` | #2027 |
| CD9 | 71 | `$.log_if_contains_state(...)` wrapping of `console.*` calls | `visitors/CallExpression.js` | #2028 |
| CD10 | 45 | the `$.apply(fn, this, $$args, Comp, [line, col])` event-handler wrapper | `visitors/shared/events.js` | #2029 |
| CD11 | 8 | **bug** — emitted `$.add_locations` position tuples are off by 1–2 columns | `transform-template/index.js` | #2030 |
| CD12 | 6 | `$.add_svelte_meta(...)` missing (1) or carrying a `1, 0` placeholder position (5, all `<svelte:self>`) | `visitors/RenderTag.js`, `visitors/shared/component.js` | #2039 |
| CD13 | 3 | **bug** — `$inspect(...)` is left untransformed instead of becoming `$.inspect(...)` | `visitors/CallExpression.js` | #2040 |

Three of these are correctness bugs rather than unported features, so they are
tracked apart: CD11 and CD12 emit the right call with the wrong source position,
and **CD13 emits code that does not run** — `$inspect` is not a runtime binding,
so a dev build of any component using it throws `ReferenceError`. CD13 is the
highest-severity entry in this table despite being the smallest. CD11 only
becomes observable once CD1 lands.

The remaining 261 entries not in the table above are residue of the same root causes
rather than separate ones, so they are expected to clear with their parents.
Two things spread them out. The statement reshaping CD6/CD7/CD9 perform
(`const x = (await …)()`, multi-line `console.*`) relocates the divergence
within the file; and the `expected`/`actual` pair recorded per failure comes
from `firstDiffLine`, which is computed on the **byte** diff, while the pass/fail
verdict comes from `astEquivalent`. A reported first differing line can
therefore be a comment or JSDoc line — position noise `astEquivalent` itself
absorbs — while the divergence that actually failed the entry sits further down.
Read the reported line as a locator, not as the root cause. (This is not the
oxfmt-unparsable fallback: the enrolment run formatted cleanly, 0 parse
diagnostics on both trees.)

**#1981 is confirmed absent.** The enrolment run contains zero
`$$ownership_validator.binding(` divergences, so the #1989 fix holds across the
whole corpus. CD8 is a *different* ownership gap (mutation tracking, not
bindings) that only this lane could surface.

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
