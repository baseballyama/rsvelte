# known-failures.{client,server,client-dev,server-dev}.json — why each entry is accepted

The output-equality corpus compiles every source with both the official Svelte
compiler and rsvelte (CSR + SSR + CSR/SSR `dev: true`) and requires byte-identical output after
comparison-side normalization. The comparison is **AST-structural**
(`normalize.astEquivalent` via acorn): comment position, `${}` line-wrapping,
redundant parens, and quote style are already absorbed, so any entry here is a
**genuine structural (AST-distinct) divergence** in the generated code, not a
cosmetic one.

The ratchet (`corpus-compat.yml`) fails only on an `(id, target)` pair not in the
baseline — the lists may only shrink, never grow. Each accepted entry must be
justified in this file.

The JSON files are CI-enforced this way, but the header counts and (for
client-dev) the cluster-table residue below are hand-maintained prose and were
not checked anywhere, so a burn-down PR could update the JSON without keeping
this file's numbers in sync (#2062, drift from #2048). `corpus-compat.yml` now
runs `scripts/compat-corpus/known-failures-md-check.mjs` first, which fails
the job if a header count (or the client-dev "attributed to a cluster" /
"remaining" reconciliation, when that sentence is present) stops matching the
JSON array length.

The five skeleton seeds from #1924 are gone (#2017): #1973 (fixed by #1996),
#1974 (fixed by #1988), #1975 (fixed by #1993). All three divergences the
checked-in pattern corpus (#2019) surfaced are gone too: the two SSR
destructuring ones (#2033, #2034) were fixed by #2036, and the block-local
snippet render tag (#2031) by #2057.

## Client (`known-failures.client.json`, 277 entries)

Partition of `known-failures.client.json` by verdict: `237 + 4 + 3 + 33 + 0`

- **237 — the generated JS differs** (`js` / `code-differs`).
- **4 — both compilers reject the entry with a different error code.**
- **3 — one compiler rejects and the other compiles.**
- **33 — the generated CSS differs.**
- **0 — rsvelte's output is not JavaScript**, ratcheted in full in
  [`parse-known-failures.md`](parse-known-failures.md) and listed here too
  because unparseable output is necessarily byte-different.

Every one of the remaining 277 arrived with the wave-2 enrolment (#3130) and is described
in § *Wave-2 enrolment*. The list was **0** before it, and the one entry it ever
held — #2031, a `{#snippet}` declared inside
an `{#if}` branch and `{@render}`ed as a sibling in that same branch, lowered
through the dynamic path (`$.comment()` anchor + `$.snippet(...)`) instead of
being called directly — was fixed by #2057: the scope builder gives each branch
its own scope, but the analysis visitor never entered it, so the render tag's
lexical lookup started above the branch and missed the snippet binding.

It stayed empty through the `runed` / `svelte-toolbelt` enrolment, which raised
the module share of corpus entries from 3.4% to 5.1% — modules were the thinnest
surface the corpus covered. That enrolment surfaced eleven divergences and every
one that this target can see was fixed before it landed: #2300 (`$state`
declaration in a module not lowered), #2301 (reactive getter not unwrapped at a
call argument), #2302 (missing `$.proxy`), #2303 (private class-field state
read), #2304 (`$.template_effect` without its deps array), #2305, #2309, #2330
and #2343 (the spurious `$.set` proxy flag for a `BinaryExpression`). #2307
(spurious `/* @__PURE__ */`) is comment-only, so the AST-structural comparator
does not see it at all; it burns down with the esrap comment epic (#2336).

An empty list is not the same claim as "client output matches upstream
everywhere". Divergences this target keeps on purpose — because reproducing
upstream's bytes would emit invalid JavaScript — are recorded in
[`deliberate-divergences.md`](deliberate-divergences.md), each pinned by a test.

## Server (`known-failures.server.json`, 71 entries)

Partition of `known-failures.server.json` by verdict: `62 + 4 + 5`

- **62 — the generated JS differs.**
- **4 — both compilers reject with a different error code.**
- **5 — one compiler rejects and the other compiles.**

All 71 arrived with the wave-2 enrolment (#3130); this target was at 0 before
it. The last pre-enrolment entry was #2308, from the `runed` / `svelte-toolbelt` enrolment:
`watch.test.svelte.ts` writes `runs = runs + 1` and rsvelte **contracted** it to
`runs += 1` (that direction, not the reverse). The `.svelte.(js|ts)` server path
round-trips through the client transform, which rewrote the assignment, so the
operator was already gone before the server printer ran. Fixed by lowering
`$state` to its bare initializer *before* the client transform, so state
bindings on this path are never signal-wrapped and nothing has to be
reconstructed.

Its previous sole entry was the SSR half of the same #2031 divergence (the extra
`<!---->` the dynamic form pushes), fixed by the same change.

The two SSR destructuring seeds this corpus also surfaced — #2033 (computed /
quoted key dropped in a destructured `$derived`) and #2034 (`$.to_array` arity
with a rest element) — were resolved by #2036, which mirrored #2010's client
destructuring fixes onto the server target.

## Server dev (`known-failures.server-dev.json`, 71 entries)

The `server-dev` target is the server transform with `dev: true`. It separately
ratchets server-only development instrumentation: component metadata, element
locations, dynamic-element validation, snippet validation, and injected CSS.

Partition of `known-failures.server-dev.json` by verdict: `62 + 4 + 5`

- **62 — the generated JS differs.**
- **4 — both compilers reject with a different error code.**
- **5 — one compiler rejects and the other compiles.**

All 71 arrived with the wave-2 enrolment (#3130); this target was at 0 before
it. Its counts now match `server`. The one extra entry was SoftShadows output
that became unparseable only with `dev: true`; #3877 corrected the component
callback tail-comment insertion point, so both its parse and output entries have
been retired.

## Client dev (`known-failures.client-dev.json`, 314 entries)

Partition of `known-failures.client-dev.json` by verdict: `277 + 4 + 3 + 30 + 0`

- **277 — the generated JS differs.**
- **4 — both compilers reject with a different error code.**
- **3 — one compiler rejects and the other compiles.**
- **30 — the generated CSS differs** (three fewer than `client`).
- **0 — rsvelte's output is not JavaScript.**

All remaining 314 arrived with the wave-2 enrolment (#3130); this target was at 0 before
it, and it is the largest of the four — 40 JS entries that `client` does not
carry, which is the reason it is ratcheted separately.

The `client-dev` target is the `client` target with `dev: true`. It is a
separate ratchet because `dev` gates 18 client codegen files plus the CSS
transform (`css/index.js:146` keeps empty rules in dev), so a dev-only
divergence is invisible to the two `dev: false` targets — #1981
(`<X.Y bind:…>`) was live in 524 corpus files and undetected for exactly that
reason. CSS is compared for this target too and currently contributes 34
CSS-only baseline entries.

The enrolment seed was 4566. The dev-cluster campaign (#2020, #2022–#2026,
#2029, #2030, #2039, #2040, and the #2021 series) took it to 896, #2116
(legacy instance-script instrumentation) to 639, #2090 (module-script
`await` instrumentation) to 427, #2028 (`console.*` wrapping) to 306, #2027
(ownership validation on `bind:` member mutations) to 284, #2231 (the same
validation on member assignments inside `$effect`) to 281, and the legacy
each-block `bind:` accessor shape (named `function get()` / `function
set($$value)` instead of arrows) to 234, the residual `$.tag` tail
(uninitialized legacy state without a trailing semicolon) to 224, and #2089 (the
same ownership validation on assignments and update expressions written in
template expressions, which are converted through the typed `JsNode` path) to
203, and the legacy half of the same validation (`prop_mutation_vars` was
gated on `analysis.runes`, so no `export let` prop member mutation in an
instance script was ever wrapped) to 187 — all with no regression on `client`
or `server`, both of which were empty throughout that campaign. Making the Phase-3 in-place path the one
that ships took it to 186: the text path dropped the `;` after a state
assignment that an `await` followed, so the two ran together into a call chain.
The dev eager read of a snippet parameter that carries a default value
(`{#snippet item(id = expr)}` — the plain-identifier parameter took a code path
that skipped the `$.get(id);` upstream emits so `Cannot access x before
initialization` still throws) took it to 180. The `bind:this={obj.foo}` setter
took it to 133: upstream builds that setter by visiting a synthesized
`obj.foo = $$value` assignment, so it reaches `validate_mutation()`
(`shared/utils.js:300`), whereas rsvelte built it directly and so emitted
neither the wrapper nor the preamble. Eight of the 47 cleared entries are that
fix; the rest were already passing and had simply not been re-measured since the
PRs that fixed them.

Seven more dev fixes took it to 91: arrow-only event-handler naming
(`shared/events.js` names a handler only when it is an
`ArrowFunctionExpression`, so a bubble handler no longer burns a
`scope.generate()` slot), the `$.tag` label for a hand-written accessor over a
private field, `state.filename` (`analysis.filename` held only the basename, so
every dev source location was short), the `;` a wrapped whole-statement `await`
needs before the statement ASI used to separate, the quote style of the
`console.*` wrap's method name, the prop-mutation locator consuming a match
written inside a comment or a string, and the comments leading a `$:` statement
that has a surviving successor.

Emitting the `$.assign` stale-value wrap from the typed `JsNode` path took it to
85. Three of the six cleared entries are that fix; the other three are the
equality instrumentation the dev constant-fold fix had already corrected without
being re-measured.

Pairing each `$$ownership_validator.mutation(...)` with the source position of
its **own** member path took it to 46. The locator scanned the source with a
single monotonic cursor per prop, which assumes mutations are emitted in source
order; legacy `$:` statements are re-grouped in dependency order, so every
mutation of a prop that is mutated more than once reported its neighbour's
line/column. 16 of the 39 cleared entries are that fix (`svelthree/*` and
`svelte-ux/DateRange`, all of which mutate one prop from several `$:`
statements); the rest were already passing and had not been re-measured since
the PRs that fixed them.

Pairing them by the *value* each mutation writes took it to 42. Matching on the
member path alone cannot separate two mutations of the same member, and matching
in output order gets them backwards whenever a `$:` body — emitted at the end as
a `legacy_pre_effect` — competes with a function declared after it. The locator
now also reads a chain written through a TypeScript non-null assertion or an
optional access (`selected!.from`, `selected?.from`), which it had been skipping
entirely.

Building the injected stylesheet's dev source map took it to 22. `css/index.js`
runs the whole `.svelte` source through MagicString, so the map is not a
per-token table: a segment lands at the first character of every unedited chunk,
after every newline inside one, and at every `addSourcemapLocation` — which the
`_` visitor calls on the `start` and `end` of every node it visits, recursing
into a `PseudoClassSelector` only for `is`/`where`/`has`/`not`. The scoping
modifier is inserted with `appendLeft`, which maps nowhere at all. rsvelte builds
its stylesheet by writing into a string, so the writer now records the source
offset of every copied run alongside the marks, and the map is emitted from
those. A selector that the transform did not reproduce verbatim (anything beyond
skipping the modifier) falls back to unmapped rather than mapping to the wrong
place. A custom element gets the map too: upstream's gate is `dev &&
inject_styles && css.code`, which `$css.code` satisfies like any other injected
stylesheet.

Honouring `path.at(-1) !== 'ExpressionStatement'` on the JSON expression path
took it to 20. That half of upstream's condition had no equivalent there, so a
bare assignment statement inside an `{@attach}` block body was wrapped even
though its value is discarded.

Restricting the component-prop exemption to a component that is a `Fragment`
child took it to 18. Upstream spells it `path.at(-2) === 'Component' &&
path.at(-3) === 'Fragment'`, and an element's children are the one container it
does not visit through a `Fragment` node, so a component nested in an element
keeps the wrap.

Nesting the legacy `$.invalidate_inner_signals` sequence inside the ownership
wrap took it to 16. Upstream builds that sequence in `build_assignment` and
hands the result to `validate_mutation`, so it is the wrap's third argument;
rsvelte's text pass matched only the `prop(...)` call and left the sequence
around the wrap instead.

Validating every prop-rooted `bind:` setter mutation took it to 14.
`validate_mutation` gates on the *root binding* being a prop, not on whether the
mutation itself is wrapped, so a runes non-bindable prop — which assigns the
member directly, with no `prop(…, true)` call around it — needs the wrap too.

Labelling every proxied `$state` initializer took it to 12.
`create_state_declarator` decides on the **visited** expression, so in dev an
`a === b` initializer has already become a `$.strict_equals(...)` call and
therefore proxies (an arithmetic `BinaryExpression` still does not); and a
`$state` declared inside a template handler body reaches the expression
converter, which had no way back to the declarator's name.

Instrumenting a `$derived` destructuring default took it to 11. The pattern's
source text was lifted verbatim before the walk reached it, so a default value
never got the dev equality rewrite any other expression gets.

Locating the traced function past a comment took it to 9. The `$inspect.trace()`
label carries `locate_node(fn)`, which rsvelte finds by scanning backwards from
the call — and a comment between the function head and the call answered for it.

Resolving a shadowed name through the scope chain a script reference actually
sees took it to 7. Two things fed the `console.*` wrap's `scope.evaluate`
lookup the wrong binding: a legacy instance declaration wrote its initializer
onto a same-named module binding (the write resolved through the root scope's
declarations only), and a template binding — an each item — stayed a candidate
for a reference inside the instance script.

Leaving the async-destructuring IIFE uninstrumented took it to 4. `[a, b] =
await …` is lowered to `await (async ($$value) => { … })(…)`, and the dev
`await` pass wrapped that generated call as well as the source `await` it was
built around — upstream destructures after a single instrumented `await`.

Four last fixes took it to 0. `build_assignment` hands the `await` it adds to
`context.visit`, so `$.assign_async(…)` is instrumented like any other `await`
while `arrow` (`utils/builders.js`) collapses the lazy getter it wraps back to a
synchronous `() => x()`. A site the transform decision rejects still has to be
spent, or a later identical member chain reports its position. The dev `await`
wrapper opens with `(`, so it continues *any* statement ASI left open — not just
another wrapped `await`, which is all the previous check covered. And in a
partially pruned selector list the `/* (unused) ` markers are `prependRight` /
`appendRight` insertions while the separator before a pruned selector goes
through `overwrite`, which keeps the chunk it replaces — so both selectors and
that separator still carry source-map segments.

### What is left

Nothing. The last entry — `runed/…/demos/scroll-state.svelte`, which writes
`onsubmit={preventDefault(() => (scroll.x = x))}` and had rsvelte emitting the
bare `scroll.x = $.get(x)` where upstream wraps it as
`$.assign(scroll, "x", "=", $.get(x), "…scroll-state.svelte:41:69")` — is fixed.
The event-attribute exemption from the coerced-away-proxy dev warning
(`AssignmentExpression.js:170-236`) was applied to every arrow anywhere in the
attribute expression, but upstream requires the arrow to *be* that expression
(`path.at(-2) === 'RegularElement'`), so an arrow passed as a call argument was
never exempt. Every other dev-helper cluster the enrolment-era table tracked —
the equality instrumentation, `$.track_reactivity_loss`, ownership mutation
validation, `$.tag()` / `$.tag_proxy()`, `console.*` wrapping and the signal
read/write row — was already empty.

Two divergences remain here, both deferred only because **no corpus entry
reaches them** — each has a check that distinguishes fixing from not, so neither
is unverifiable:

- **Over-reach.** The exemption is carried by a level flag that stays set for the
  whole body conversion, so an assignment nested *inside* an exempt arrow's body
  is exempted too. `onclick={() => (a.b = f(() => (c.d = e)))}` must emit
  `$.assign(c, 'd'` and must not emit `$.assign(a, 'b'` — one input, both signs.
  A boolean cannot express upstream's third conjunct, which is the *identity*
  test `expression === context.path.at(-1)`; the exempt arrow has to be carried
  by identity, not by a level.
- **Under-reach, the opposite direction.** Upstream's guard names
  `SvelteElement` alongside `RegularElement`, but `visit_event_attribute` is
  reached only from `regular_element.rs`, so `<svelte:element this={tag}
  onclick={() => (o.x = v)}>` is never exempt and emits
  `$.assign(o, 'x', '=', v, …)` where upstream emits none. Measured, not
  inferred.

Counting method, for whoever picks this up: attribute an entry by **comparing
how many times each helper appears** on each side, never by the first differing
line. A pure statement **reordering** reports as the helper on the expected side
being *absent*, so a positioning bug reads as an unported feature — #2020, #2022
and #2023 were all filed as "not emitted" and all turned out to be emitted in
the right number and the wrong place.


## Wave-2 enrolment (#3130) — where all 1,413 entries come from

The corpus went from 37 corpus sources to 104 (103 pinned repositories plus
the in-repo `pattern-corpus`) and from 14,780 entries to 34,601. Every entry in all four ratchets above comes from one of the 67 new
repositories: **49 of them contribute at least one, and the 37 pre-existing
sources contribute zero.** That is the positive control for the enrolment — it
added inputs, it did not regress anything already covered.

The four ratchets were re-measured after this branch was rebased onto `main`,
which took them from 1,977 entries to 1,413: `client` 663 → 542, `server`
307 → 148, `server-dev` 304 → 145, `client-dev` 703 → 578. Nothing here was
fixed by the rebase itself — `main` had landed the fixes and the entries had
simply not been re-measured against it, which is why a baseline is a
measurement of the merge base and has to be retaken after one moves.

Five defect classes the enrolment found were fixed rather than listed here.
Four of them are not divergences you can ratchet at all; the fifth is, and the
gate that found it is the one that compares rsvelte to nothing:

- **Two CSS-parser infinite loops.** `parse_rule` records
  `css_expected_identifier` and consumes nothing when the selector is empty, so
  both callers that dispatch to it spun forever. `@media #{devices.$break1} { … }`
  (SCSS interpolation in plain CSS, from appwrite-console) reaches the first: the
  prelude scan stops at the interpolation's brace, leaving ` {` as a block item.
  A hang is not a verdict — it stalls the whole sweep, so `compile.mjs` now kills
  a worker that stops making progress and records `rust_hang`.
- **Two UTF-8 char-boundary panics**, both slicing a `&str` at a byte offset
  measured somewhere else: the source-map column (an em dash in an instance-script
  comment, threlte and primo) and the `svelte-ignore` back-scan (a variation
  selector in markup, dev mode only, kite-public). Each aborted the process.
- **The UTF-8 BOM was template text.** rsvelte had no equivalent of upstream's
  `remove_bom`, so a component whose markup is one child element emitted a stray
  text node around it. **320 of the enrolment's divergences were this one
  character** — 14% of the backlog, in cnblocks alone.
- **A `$store` setter read its store as a bare name.** Upstream resolves the
  store *variable* through its own binding (`get_store()`), so the first
  argument of `$.store_set` is `$.get(store)` / `store()` / `$$props.store`.
  Both ports of the store builders emitted the bare identifier and left a later
  pass to fix it up — which the `$.store_mutate` call sites did and the
  `$.store_set` ones did not, so eight bind-setter entries (mathesar,
  svelte-lexical, svelvet) were wrong. **The transform-idempotency gate is what
  found it**: applying the transform twice produced the *correct* text, and no
  amount of output comparison names which of the two passes is the defect.

### The largest remaining clusters

Counts are `(id, target)` pairs and clusters are keyed by the first differing
line, so this is a diagnostic ordering, **not a partition** — most of the tail
is one entry. `E:` is official, `A:` rsvelte.

| n | target | first differing line | example repo |
|---|---|---|---|
| — | — | — | — |

**Every appwrite-console cluster is gone, and with it both server targets.**
Six of the ten rows above used to be a `$$renderer.push` / template-string
divergence on appwrite-console, and the largest was 71 pairs; `main` fixed them
before this branch was rebased onto it. The TypeScript legacy-reactive prop-read
clusters were retired by #3934. The 45 huly entries whose first difference was
a destructuring assignment returning `res`, `result`, or `$$value` from its
generated IIFE were all the statement-boundary defect fixed by #3933 and are
now retired from both client baselines. The remaining two Huly files combined
that ordering graph with a nested `[[mode]] = config`: Phase 2 recorded `mode`
as an assignment, but Phase 3 rebuilt the assignment side with a text scan that
could not cross the destructuring brackets. Both graph sides now consume the
same typed metadata, retiring four more target-pairs. The two open-webui entries whose comment
text rewrote `$i18n.languages` to `$i18n().languages` were fixed by #3941's
comment-aware store-read transform and are now retired from both client baselines.
Fourteen title entries across cobalt, mathesar and open-webui were one
memo-definedness defect: upstream evaluates the fresh `$N` returned by its
memoizer and retains `?? ''`, while rsvelte evaluated the original call and
incorrectly removed the fallback. The single- and multi-expression title paths
now both preserve it, retiring 28 target-pairs.
The two threlte `bush.svelte` files destructure `[$gltf, $texture1]` in an
`{:then}` clause while an unrelated top-level `gltf` store exists. The lexical
store scan ignored the await scope and synthesized a root `$gltf` subscription;
template-block collection now removes each/await/snippet bindings only inside
the fragment where they shadow, retiring four target-pairs without hiding a
same-named top-level store reference elsewhere.
Threlte's `Particle.svelte` binds a component instance into a member of a runes
mode each item. The synthesized `bind:this={audio.ref}` setter now records the
same each-item mutation as upstream's transform, retaining the required index
parameter and retiring its client and client-dev entries.
The three AdventureLog entries whose same-line legacy-prop comments disappeared
from the final `$.prop` argument were fixed by #3937's comment-preserving prop
lowering and are now retired from both client baselines.
The two sparrow-app entries whose callback-leading `"click dont save"` string
statements disappeared were fixed by restoring OXC's separately stored
`FunctionBody.directives` before the ordinary statements, and are now retired
from both client baselines.
The two svelte-commerce entries whose generated `<meta>` local was unnecessarily
renamed to `meta_1` were fixed by excluding `import.meta` and `new.target` name
slots from the Phase 2 global-reference conflict set and are retired from both
client baselines.
No remaining first-difference cluster
in the latest completed report contains more than two entries per target; the
table records the tied largest signatures so the next pass starts from data.

### The SCSS custom-property under-rejection cluster

This is the class no amount of corpus growth found before, because it needs
code that is *almost* legal. The latest completed report's observable residue,
filtered through the current baselines, was three source entries (twelve
target-pairs), all under-rejections of SCSS interpolation in a custom-property
value. The style look-ahead now follows upstream and treats the first `{` as
the start of a nested rule, producing `css_expected_identifier`; all three
entries are retired here.

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
