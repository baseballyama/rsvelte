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

## Client (`known-failures.client.json`, 0 entries)

Empty. The one entry this list ever held — #2031, a `{#snippet}` declared inside
an `{#if}` branch and `{@render}`ed as a sibling in that same branch, lowered
through the dynamic path (`$.comment()` anchor + `$.snippet(...)`) instead of
being called directly — was fixed by #2057: the scope builder gives each branch
its own scope, but the analysis visitor never entered it, so the render tag's
lexical lookup started above the branch and missed the snippet binding.

## Server (`known-failures.server.json`, 0 entries)

Empty. Its one entry was the SSR half of the same #2031 divergence (the extra
`<!---->` the dynamic form pushes), fixed by the same change.

The two SSR destructuring seeds this corpus also surfaced — #2033 (computed /
quoted key dropped in a destructured `$derived`) and #2034 (`$.to_array` arity
with a rest element) — were resolved by #2036, which mirrored #2010's client
destructuring fixes onto the server target.

## Client dev (`known-failures.client-dev.json`, 49 entries)

The `client-dev` target is the `client` target with `dev: true`. It is a
separate ratchet because `dev` gates 18 client codegen files plus the CSS
transform (`css/index.js:146` keeps empty rules in dev), so a dev-only
divergence is invisible to the two `dev: false` targets — #1981
(`<X.Y bind:…>`) was live in 524 corpus files and undetected for exactly that
reason. CSS is compared for this target too, and is clean: 0 css-mismatches.

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
or `server`, both of which are empty. Making the Phase-3 in-place path the one
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

Four more took it to 49: the computed path element of an
`$$ownership_validator.mutation(...)` going through the binding's own read
transform, each prop mutation reporting its *own* source position (matching on
the member names it writes rather than consuming positions left to right, so a
`$:` body moved to the tail as a `legacy_pre_effect` cannot steal one), the
`$.assign` coerced-proxy warning on member assignments written in a script, and
the `$.tag` label of a class *expression* field (`'[class].foo'`, and the public
name when a public field was lowered to a private backing).

### How the counts below are derived

The enrolment-era table attributed each entry by its **first differing line**.
That is a trap this campaign hit four times: a pure statement **reordering**
reports as the helper on the expected side being *absent*, so a positioning bug
reads as an unported feature. #2020, #2022 and #2023 were all filed as "not
emitted" and all turned out to be emitted in the right number and the wrong
place.

The table is now derived by **comparing how many times each helper appears** on
each side, which separates the two directions and cannot be fooled by order:

| Cluster | under-emits | over-emits | Upstream emitter (`phases/3-transform/client/`) | Issue |
|---|---:|---:|---|---|
| `$.assign` / `$.assign_async` | 6 | 2 | `visitors/AssignmentExpression.js` | #2064 |
| signal read/write (`$.get` / `$.set` / `$.update`) | 3 | 0 | `visitors/shared/utils.js` | #2064 |
| equality instrumentation | 1 | 0 | `visitors/BinaryExpression.js` | #2064 |
| `$.track_reactivity_loss(...)` | 0 | 3 | `visitors/AwaitExpression.js` | #2064 |
| ownership mutation validation | 2 | 0 | `transform-client.js`, `visitors/shared/{component,utils}.js` | #2027 |
| `$.tag()` / `$.tag_proxy()` | 2 | 0 | `visitors/VariableDeclaration.js` | #2064 |
| `console.*` wrapping | 0 | 2 | `visitors/CallExpression.js` | #2064 |

The ownership row splits into two halves: entries missing the
`$.create_ownership_validator($$props)` preamble entirely, and entries that have
it but under-emit call sites. The preamble half is now empty; both survivors
emit their `$$ownership_validator.binding(...)` calls and are missing exactly one
`$$ownership_validator.mutation(...)` each.

21 entries are attributed to a cluster; the remaining **28** show no
difference in any dev helper: 18 are the CSS sourcemap the `$$css`/`$css`
payload carries in dev, 5 are statement ordering inside an instance script, 2
are a `$.trace` label's line:column, 2 are redundant parentheses around an
`$$ownership_validator.mutation(...)` and 1 is the lowering shape of a lazy
`??=` whose right-hand side awaits. All are tracked in #2064. The legacy
`bind:` `function get()/set()` shape was 47 entries of that residue and is
fixed: `build_each_block_accessor_parts` now hands the element `bind:` path the
unthunked getter body plus the setter body, so `dev` can emit upstream's named
accessors (`BindDirective.js:46-54`). The component `bind:` path keeps consuming
the same bodies for its object-literal `get`/`set` methods.

The 18 CSS entries split in two. Seven emit **no** map at all: rsvelte gates the
`/*# sourceMappingURL=… */` trailer on `!is_custom_element`, where upstream's
guard is `dev && analysis.inject_styles && css.code` (`css/index.js:68-70`), so
a custom element's `$$css.code` never carries one. The other 11 emit a map whose
segments are finer than upstream's: `css/index.js`'s `_` visitor calls
`addSourcemapLocation` on every CSS AST node's `start` and `end`, and MagicString
then emits a segment at each of those plus every chunk start and every line start
inside an unedited chunk — a removal, being an edited chunk with an empty body,
emits nothing. rsvelte's generator matches tokens by name instead, which is a
different model, so closing this row means porting MagicString's `generateMap`
rather than tuning the heuristic.

### What is left of the `$.assign` row

`$.assign(object, 'prop', operator, value, location)` is upstream's dev warning
for a coerced-away proxy (`AssignmentExpression.js:170-236`): it fires only when
the assignment's *value* is used (`path.at(-1) !== 'ExpressionStatement'`), the
operator is non-coercive, and the right-hand side is not a known primitive. The
script collector for it landed with `assign_dev_ast`; what is left is the
**template** path's answer to "is the value used". Five of the six under-emits
and both over-emits are the same confusion in the two directions: a concise
arrow body (`{@attach (node) => (node.textContent = …)}`, `onValueChange: (e) =>
(globals.panel = e.value)`) is a used value and is not wrapped, while a
statement inside a block-bodied arrow (`(node) => { context.fillStyle = color; }`)
is not and is. The sixth under-emit is a location argument, not a missing call.

### What is left of the equality and await rows

Both rewrites ride the instance-script AST pass, which sat under
`if analysis.runes` — so a legacy (non-runes) component was never instrumented
at all. #2116 gave the legacy path its own entry point into the same two
AST collectors (`instance_dev_tail_ast`), which cleared 257 entries and left
every `track_reactivity_loss` under-emit module-side (197 in a component's
`<script module>`, 18 in a `.svelte.(js|ts)`). #2090 closed those by adding the
same `await` collector to `module_dev_tail_ast`'s batch, clearing a further 212
entries:

Both instrumentations are now emitted for every script kind; only over-emits
remain (plus one equality under-emit that is a template expression, below). The three `track_reactivity_loss` over-emits are all the *destructured*
async assignment shape (`[a, b] = await …`): rsvelte lowers it to an async IIFE
and instruments the IIFE call as well as the inner `await`, where upstream
destructures after a single wrapped `await`. That is a lowering-shape
difference, not an instrumentation gap — #2064 long-tail.

The one equality residual is likewise not an instrumentation gap: it is a
`typeof window === 'undefined'` written inside a component prop's arrow, which
the template path hands through unrewritten — #2064 long-tail.

### What is left of the `$.tag()` row

The #2021 series covered every declaration shape reachable from the legacy and
runes script passes; the last one was an uninitialized legacy source with no
trailing semicolon (`let sub` on its own line, which is what a `bind:this`
target or a stripped TypeScript annotation leaves), whose emitter built the
`$.mutable_source()` call without the dev label.

The 2 remaining under-emits are both `$.tag_proxy` and neither is a labelling
gap. One is a `$state(…)` declared *inside a template event handler*, which the
declarator tag pass never sees because it walks script statements, not template
expressions. The other is `$state(a === b)`: upstream calls `should_proxy` on
the **already-visited** initialiser, so the dev-only `$.strict_equals(…)`
rewrite turns a `BinaryExpression` (never proxied) into a `CallExpression`
(proxied), and rsvelte decides before that rewrite. Both are #2064 long-tail.

### What is left of the `console.*` row

The row was 68 under / 73 over: two ad-hoc predicates decided the wrap, and
neither was upstream's `scope.evaluate(arg).has_unknown`. #2028 routed both onto
the `Evaluation` lattice already ported for the server transform, and gave the
template path (event handlers, `{expr}`, `$:` bodies) a decision at all — it had
none, which was every under-emit.

The 2 remaining over-emits are both *shadowing*: the generated text the script
pass rewrites has no scope chain, so an identifier is only resolved when the
component declares that name exactly once. `<script module>`'s `foo` next to the
instance script's `foo`, and a `$state` `method` next to an `{#each}`-destructured
`method`, therefore stay conservative. Resolving them needs a scope-carrying
rewrite of the script path — #2064 long-tail.

### What is left of the ownership row

The 2 remaining under-emits are both `bind:this={prop[expr]}` on an element
inside an `{#each}`: the setter upstream builds is
`($$value, j) => $$ownership_validator.mutation(null, ['divs', j], …)`, whose
path tail is the each-block index *expression*, not a literal member name.
rsvelte's `bind:this` path wraps only the non-parameterised setter shape, so the
each-scoped one falls through — #2064 long-tail.

### What is left of the signal read/write row

The 3 under-emits are all a rune declared *inside a nested function* whose name
also exists as a top-level binding, which `transform_shadowed_local_state_vars`
handles by rewriting just the enclosing function body. It locates the
declaration by the literal text `<kw> <name> = $.state(` — and in dev the
`$.tag(...)` wrap already sits between the `=` and the rune call, so the probe
misses and the whole body goes untransformed.

**#1981 is confirmed absent.** The run contains zero
`$$ownership_validator.binding(` divergences, so the #1989 fix holds across the
whole corpus. The ownership row above is a *different* gap (mutation tracking,
not bindings) that only this lane could surface.

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
