# Generated shape matrix — known failures

Ratchet for `scripts/compat-corpus/matrix/run.mjs` (#2281 Gate 2). Shrink-only and
two-sided: a new divergence fails CI, and so does a listed entry that already passes, so
the PR that fixes entries re-baselines in the same PR
(`node scripts/compat-corpus/matrix/run.mjs --update-baseline`).

## Why this gate exists

The collected corpus samples the **marginal** distribution of published Svelte code. Every
bug in the #2253/#2254/#2255/#2256 batch was an **interaction** — a binding kind × a
syntactic position, or a construct × a comment slot — and a found corpus under-samples
interactions exponentially:

| shape | occurrences in the 14,026-entry corpus |
|---|---|
| #2254 — `{#each … as X}` item as a `switch` discriminant | 0 |
| #2253 — `#private` `$state` assigned from a literal containing a `//` comment | 0 |
| #2256 — `svelte-ignore` before an object-literal property | 6 |

`client` and `server` were at **0 known failures** — saturated — when all four were
reported. Growing the corpus from 14k to 140k real files moves those counts from 0 to
approximately 0. Generating the product moves them to whatever the product contains.

## Scope of what a listed entry means

Normalization here is identical to `verify.mjs` (flatten template holes → oxfmt → strip
blank lines), so formatting-only differences are tolerated exactly as the corpus gate
tolerates them. An entry is a divergence that survives that.

## Matrix known failures (`matrix-known-failures.json`, 934 entries)

Partition of `matrix-known-failures.json` by family: `2 + 212 + 0 + 18 + 60 + 62 + 3 + 318 + 251 + 8`

### `binding-position` — 2 entries

Both are `label.body` on the **server** target (`derived-local`, `store-auto-sub`), and in
both **rsvelte's output is the correct one**.

`submodules/svelte/.../3-transform/server/visitors/LabeledStatement.js` returns early for
a non-`$` label **without calling `context.next()`**, so zimmerframe never descends into
the labeled subtree; the client visitor calls `context.next()` at the same guard. Since
`$.derived()` returns a function in `svelte/internal/server`, upstream emits
`if (doubled)` — always truthy — where every other position emits `doubled()`. Store
auto-subscriptions inside a labeled body are mis-emitted the same way. Reported upstream;
these two entries clear when the fix lands in `submodules/svelte`.

The rest of the family (7 bindings × 47 positions × 3 targets, minus these) passes. It is
the axis that found #2254 plus `SwitchCase.test`, class-expression field initializers and
class-expression computed method keys, all fixed in #2269.

### `comment-slot` — 212 entries

Two sub-clusters with distinct causes: the `.svelte` template seeds below and the
remainder of the `.svelte.(js|ts)` module path (#2399). The class-field relocation
(#2437) cleared entirely.

#### `.svelte` template seeds — 140 entries

One comment inserted at each line boundary inside every `<script>` region of 7 seeds,
across 8 comment kinds. A comment is the one token that may appear between any two other
tokens, so any code path that finds a terminator by scanning bytes rather than lexing
breaks here — #2253 was five such scans in one file.

Classified by comparing the **multiset of comments** in each output:

| what diverges | entries | of which server |
|---|---|---|
| rsvelte drops a comment the official compiler keeps | 80 | 64 |
| the comment survives but lands somewhere else | 32 | 0 |
| rsvelte keeps a comment the official compiler drops | 28 | 24 |
| **anything other than the comment itself** | **0** | — |

The last row is the important one: **no generated mutant changes rsvelte's codegen
semantics.** The mutation is semantics-preserving and so is the output; what diverges is
comment reproduction only. That bounds the severity of this backlog — it is an output-
fidelity gap, not a correctness gap — and it is why this ratchet starts large without
blocking the gate from being useful on day one.

By seed:

| seed | entries |
|---|---|
| `legacy-reactive` | 28 |
| `module-script` | 56 |
| `await-block` | 24 |
| `class-private-state` | 8 |
| `class-static-block` | 8 |
| `snippet-render` | 8 |
| `const-fold-line-continuation` | 8 |

The 20 entries #2437 cleared were the `client` / `client-dev` halves of
`class-private-state__L03__*` and `class-static-block__L07__*` — the line-comment kinds
only, at the one line in each seed that is a private rune field declaration. Both seeds
regressed the same way because `emit_class_field` applied the public-field comment
placement (after the `=`) to private fields too.

The 168 entries #2504's fix cleared were all on `server`, and all the same defect: a
comment INTERIOR to a top-level script statement. The SSR path re-parses each top-level
statement from its source slice and used to collapse every span of the result onto a single
address, so the only comments it could replay were the LEADING ones in the gap before the
statement. Statements that are re-parsed WHOLE now keep their relative positions, which is
what upstream gets for free by keeping the original nodes' `loc`.

The 28 entries #2368's fix cleared were the `client` / `client-dev` halves of
`legacy-reactive__L06__*` and `legacy-reactive__L07__*` — the two line slots inside the
seed's `$:` block body. The client text pass deleted a reactive statement's comments
outright; upstream deletes nothing, and its cursor re-homes them onto the next surviving
statement (and keeps a second copy wherever a `BlockStatement` nested in the `$:` body
still carries a source span). The remaining `legacy-reactive` entries are all `server`.

Server still dominates (88 of these 140 — unchanged in count by #2368, which cleared
`client` / `client-dev` entries only), and its 64 remaining drops are one residual class: a
comment TRAILING the last top-level statement of a script region, which upstream flushes
into the generated component function's parameter list or into a template interpolation
(`$$renderer.push(\`…${$.escape(/* c */ b)}…\`)`). It is 8 line slots × 8 comment kinds.
See `server/ast/comments.rs`.

##### `const-fold-line-continuation` — 8 entries, all `server`, all the trailing class

The seed exists for the slot BETWEEN `=` and its value, which no other seed reaches: the SSR
constant fold rebuilds logical lines by scanning bytes, and a `//` there swallows the value
once the lines join (#2669 / #2671). That slot — `L04` — **matches**, on all 8 comment kinds
and all 3 targets, and it is the reason the seed was added; it is listed here only to say
that its absence from this file is a measurement, not an oversight. `L02`, `L03` and `L05`
match too. `L03` is #2669's own slot, so the byte comparison covers that defect on every PR
rather than only in the full mutation sweep on `main`.

The 8 listed entries are all `L06`, the line before `</script>`, and they join the trailing
class above rather than forming one of their own. Not #2727: that one splices a `//` INTO
`$.set(…)` on the client, whereas these are a plain drop, on `server` only, identical across
block and line kinds.

#### module path (`.svelte.(js|ts)`) — 72 entries, all #2399

Added with the module seeds that gave this family its `.svelte.(js|ts)` cases. Every one of
these 72 is the **same open bug — [#2399](https://github.com/baseballyama/rsvelte/issues/2399):
official drops a Program-level comment in the module path and rsvelte keeps it.** They are
listed as *expected to shrink when #2399 lands*, not as accepted behaviour. Do not treat this
block as a specification of rsvelte's output.

Classified mechanically, not by eye: for each entry the two normalized outputs are diffed as
line multisets, and an entry qualifies only when nothing is missing from rsvelte's side and
every extra line is a comment. The classifier is the same comparison the gate makes, run over
the gate's own artifacts. All 72 fall in that one bucket, with **nothing** in the
"rsvelte drops" or "moved/duplicated" buckets.

The 72 are one slot per seed × 8 comment kinds × 3 targets, and the slot is the same one in
each: `module-rune-exports` L08, `module-class-state` L11, `module-ts-extension` L05 are each
the line **after the seed's last statement**. So the residue is not "Program-level comments"
in general — it is a **comment trailing the end of the module**, which is the same shape as
the `.svelte` server residual above. Every other slot in all three seeds now matches, and the
diverging set is *identical* on `client`, `server` and `client-dev`, so this is one
target-independent rule and not three defects:

| seed | entries | of which server |
|---|---:|---:|
| `module-class-state` | 24 | 8 |
| `module-rune-exports` | 24 | 8 |
| `module-ts-extension` | 24 | 8 |

**Correction to the previous baseline's framing.** This block was recorded as 128 entries
"every one of these 128 is the same open bug #2399", and that was wrong for 56 of them. Those
56 were all `server` — 32 `module-rune-exports`, 16 `module-ts-extension`, 8
`module-class-state`, and all in the seeds' **leading** slots — and they were rsvelte's own
#2307 defect, comments a server `.svelte.(js|ts)` module cannot own, already fixed by #2566
before #2435 merged. So **nothing was fixed to clear them**: read the shrink as a correction,
not as progress. #2435's baseline was measured on a branch cut before #2566, so it enrolled 56
entries that already passed on the merged tree, and the gate went red on `main` itself; the run
that would have caught it was cancelled by the merge rate rather than failing (#2594). That is
the same hazard as [compatibility/gate-coverage.md](gate-coverage.md)'s "what the gate cannot
see": a baseline taken against a stale merge base is a measurement of a tree nobody ships.

The old claim that official "drops in 80 of 192 and preserves in 112" was that same server-only
entry count read as a property of the official compiler. Measured now: the three seeds have 24
insertion slots between them, so 24 × 8 comment kinds = **192 module cases**, and official
drops the comment in **3 of the 24 slots** — the trailing one of each seed, uniformly across
all 8 kinds, i.e. **24 of the 192 cases**.

#### Both sub-clusters together

The two partition claims below span the whole `comment-slot` family, so each adds the module
path's 72 to the template seeds' 140. The module path contributes to a single bucket: all 72
are *rsvelte keeps a comment official drops*, which joins the template seeds' own 28 in that
bucket for a combined 100 — the opposite direction from the 80 rsvelte drops.

Partition of `matrix-known-failures.json` entries under `comment-slot/` by what diverges: `80 + 32 + 100 + 0`

Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `56 + 28 + 24 + 24 + 24 + 24 + 8 + 8 + 8 + 8`

### `each-collection` — 0 entries

Every collection shape now matches across all targets.

Partition of `matrix-known-failures.json` entries under `each-collection/` by collection: `0`

### `keyword-regex` — 18 entries

Not the family's own axis, and not its author's doing: these appear because this PR added
warning-**code** comparison to the gate, and `keyword-regex` is the one pre-existing family whose
inputs reach a warning. All 18 are one cause on all three targets —
`perf_avoid_nested_class` never fires for a `class` declared inside a legacy `$:` reactive
statement. The six cases are the `extends` row against every host and body that puts the class
there (`legacy-reactive`, `legacy-reactive-block`, and the four `body-*` rows, which run against
`legacy-reactive` by construction).

Partition of `matrix-known-failures.json` entries under `keyword-regex/` by target: `6 + 6 + 6`

Worth stating because it is the generalization argument for the comparison: a family written for
a *parser* question, by another author, with no warning intent, contributes 60 warned (case,
target) pairs and 18 divergences. The comparison earns its place on populations nobody built for
it.

### `param-pattern` — 60 entries

Every entry is the **legacy reactive dependency list**, not the statement body: rsvelte emits
`() => $.deep_read_state(rows())` where official emits
`() => ($.deep_read_state(rows()), $.deep_read_state(id()))`, and the same omission appears in
the `$.template_effect` deps array of the two markup contexts. The body text matches on all 180
cases; only the list of what the effect re-reads diverges, so the shipped symptom is a **lost
reactive dependency** — the statement does not re-run when the prop changes.

The rule rsvelte gets wrong is *which* identifiers inside a nested function count as reads. A
name in a **parameter default** or a **computed key** is a read (it is evaluated on every call,
in the enclosing scope), and upstream's `extract_all_identifiers` / scope resolution treats it as
one; rsvelte's extractor drops every identifier lexically inside a parameter list. Hence exactly
the five `read-` shapes whose name sits there fail, and `read-body` — the same read one bracket
later — passes:

| shape | in the ratchet |
|---|---|
| `({ k = id }) => k` | yes |
| `([k = id]) => k` | yes |
| `({ [id]: k }) => k` | yes |
| `(o = { id }) => o` | yes |
| `(o = [id]) => o` | yes |
| `(k) => k + id` | no — passes |

**[D]** It is not caused by the wrap fix this family shipped with, and the discriminating case is
`(o = id) => o`: a parameter default with no brackets at all, which
`is_destructured_param_binding` rejects at its first step and therefore cannot influence. rsvelte
omits `$.deep_read_state(id())` there too, official includes it. That shape is a control, not a
row — it is *only* a dependency-list case, with no pattern in it.

12 entries per shape: 6 of the 9 contexts reach a dependency list (four `$:` forms via
`$.legacy_pre_effect`, plus `interpolation` and `each-expression` via `$.template_effect`), each
on `client` and `client-dev`. `server` has no dependency list and matches everywhere.

Partition of `matrix-known-failures.json` entries under `param-pattern/` by shape: `12 + 12 + 12 + 12 + 12`

### `directive-element` — 62 entries

19 directive kinds × 13 element kinds × 2 modes (runes / legacy), 1482 comparisons. Every one
of these 62 entries is a **live rsvelte defect**, not accepted behaviour; none was known before
the family existed. They are listed so the ratchet can hold the line while they are burned down.

The single most useful fact about the set is where it is **not**: zero entries on
`regular-element`, `regular-input`, `component` and `each-keyed-element`. All 62 sit on a
`<svelte:*>` special element. Directive handling on ordinary elements and components agrees with
official across every kind and both modes; the special elements are where per-parent handling has
drifted from upstream's one predicate per directive.

Partition of `matrix-known-failures.json` entries under `directive-element/` by verdict and host: `24 + 2 + 12 + 12 + 6 + 6`

| verdict | host | entries | cause |
|---|---|---:|---|
| `error-mismatch` | `svelte-body` | 24 | `bind:value`, getter/setter `bind:`, `let:`, and a spread attribute each diverge on both modes and all targets. |
| `js-mismatch` | `svelte-body` | 2 | Legacy-mode `bind:this` fails to make the target a `mutable_source`. |
| `error-code-mismatch` | `svelte-document` | 12 | `bind:value` rejected as `bind_invalid_name`; official says `bind_invalid_target`. |
| `error-code-mismatch` | `svelte-window` | 12 | same. |
| `error-mismatch` | `svelte-element` | 6 | `animate:` outside a keyed `{#each}` is accepted (`animation_invalid_placement`). |
| `error-mismatch` | `svelte-component` | 6 | `on:click\|preventDefault` is accepted (`event_handler_invalid_component_modifier`). |

The `js-mismatch` rows are `client` and `client-dev` only — the server target emits nothing for a
transition on either compiler, so it agrees by construction and is not evidence of anything.

**The `warning-missing:a11y_no_static_element_interactions` row — 24 entries on `svelte-element`
— is fixed by #2523 and no longer listed.** It read as one missing warning on four handler
spellings; it was the whole a11y pass, which had no call site in `svelte_element.rs`, so
`<svelte:element>` reached **none** of upstream's ~40 element rules. This family saw one of them
because `on:click` is the only a11y-relevant shape its axes construct. It is still the row that
justifies the warning comparison the family shipped with: a warning that never fires leaves the
output byte-identical, so `js.code` cannot report it.

Its verdict carried the **code**, and that was not cosmetic. With a flat `warning-mismatch`
verdict those 24 entries would have shared their ratchet key with every other warning on the same
case and target — and re-breaking #2521 (so `event_directive_deprecated` stops firing on
`<svelte:element>`) was measured to leave the gate **green**, because three of the four rows were
already listed. Keying on `warning-missing:<code>` / `warning-extra:<code>` makes that revert
produce 9 new ids instead, and is also what let #2523's fix be read off this gate as a clean
24 → 0 rather than as a change in a flat count.

The split by mode is `32` legacy / `30` runes. The two extra legacy entries are the `bind:this`
on `<svelte:body>` row, which has no runes counterpart.

### `bind-setter` — 3 entries

7 `bind:` expression shapes × 9 element kinds, 189 comparisons; all 3 entries are `client-dev`
and all 3 are the dev-mode `$.assign` wrap of #2484 — the family exists to make that defect's
element addressable.

| entry | direction |
|---|---|
| `plain__svelte-self` | rsvelte omits a wrap official emits |
| `getter-setter__svelte-body` | rsvelte emits a wrap official omits |
| `nested-arrow-in-setter__svelte-body` | rsvelte emits a wrap official omits |

Read this against how #2484 was reported: against `<svelte:component>`, which **matches** here,
while the live sites are `<svelte:body>` and `<svelte:self>`. The shapes the issue named
(`setter-through-call`, `sequence-bodied-setter`) all pass on the element and component hosts
now; what survives is the same predicate reached through a special element. A repro file cannot
find that, because the reporter picks the element.
### `removed-statement-comment` — 318 entries

The family crosses statements the SERVER transform removes (`$effect`, `$effect.pre`,
`$effect.root`, `$inspect`) with the comment slot (leading / interior / trailing), 6 comment
kinds, 3 hosts (`compileModule`, the instance script's top level, one function deep) and
whether a statement survives after the removed one. 396 cases, 1188 comparisons; the fix that
landed with it cleared 79 of them (403 → 324, all on `server`).

Every remaining entry falls in one of **four** clusters, each with its own issue. The clusters
are disjoint and exhaustive — the partition below sums to 318.

| entries | target | cluster | issue |
|---|---|---|---|
| 66 | `server` | `instance-top` × `succ-none` only: the removed statement is the last one in the script, so the orphaned comments have no anchor region to be re-homed onto. Upstream flushes them at the end of the enclosing function body; rsvelte's synthesized component-fn body is location-less, so esrap's closing `flush_comments_until` is a no-op | [#2716](https://github.com/baseballyama/rsvelte/issues/2716) |
| 108 | `client` | the `trailing` slot on `$effect` / `$effect.pre` / `$effect.root` (36 each, all 3 hosts × both successor states × 6 comment kinds): a comment trailing the call attaches to the effect's **callback argument** upstream, forcing esrap's wrapped one-argument-per-line layout; rsvelte attaches it after the call statement and keeps the call on one line. The comment survives — layout, not loss | [#2718](https://github.com/baseballyama/rsvelte/issues/2718) |
| 144 | `client-dev` | the same three statement kinds (36 each) **plus all 36 `$inspect` rows**. `$inspect` is the whole client/client-dev difference in this cluster: prod removes it, so only 2 of its 36 trailing rows diverge, while dev lowers it to a `console.log(…)` call and every trailing row then meets the same argument-wrapping rule | [#2718](https://github.com/baseballyama/rsvelte/issues/2718) |
Partition of `matrix-known-failures.json` entries under `removed-statement-comment/` by
cluster: `66 + 108 + 144`

**[D] for all three.** Each was reduced to a hand-written repro outside the family and measured
against the pinned official compiler.

**[S] on the pre-existing claim for the 258 client / client-dev entries.** They are argued
pre-existing structurally, not by an A/B: the fix that shipped with this family touches only
`3_transform/server/mod.rs` and `3_transform/server/ast/script.rs`, and the client target never
enters either. The server cluster *was* measured both ways — 145 entries with the fix reverted,
66 with it applied, on the same tree.

Note the enrolment cost, because it is real: a ratchet entry suppresses everything about the
entry it lists, so these 324 ids are now blind to any *further* regression on the same shapes
until their issues are fixed.

---

### `async-derived` — 251 entries

Added by #2540. Read the size as a **disclosure**, not a regression: not one of these 251 was
reachable by any gate in the repo before this family existed, because every harness compiles
with a fixed `{ generate, dev, filename }` and `$derived(await …)` is an `experimental_async`
compile error without `experimental.async`. The shape occurs 0 times in the 14k-entry corpus
and would occur 0 times in a 140k-entry one. This family is the first to make a compile
**option** an axis (`generate.mjs`'s `options`, merged in `run.mjs`), which is what turns the
shape from unreachable into measured.

The one thing #2540 itself fixed — the `label` / `location` arguments `$.async_derived` carries
in dev — is *not* in this list; the rows that isolate it (`instance__identifier__none`,
`instance__multi-declarator__none`, all three targets) pass. What remains are five independent
defects the family exposed on the way, all of them older than the family:

Partition of `matrix-known-failures.json` entries under `async-derived/` by cause: `154 + 39 + 18 + 12 + 13 + 13 + 2`

| # | cause | entries |
|---|---|---|
| 1 | `<script module>` / `compileModule` async-derived lowering | 154 |
| 2 | the `$$d` temp appears in the hoisted `var` list | 39 |
| 3 | `svelte-ignore` comment not reproduced on the hoisted declaration | 18 |
| 4 | a block comment before the declaration produces **invalid JavaScript** | 12 |
| 5a | no `$.save(…)` around a non-final `await` | 13 |
| 5b | `$derived.by(async …)` is suspended as if it were an async derived | 13 |
| — | server `$$renderer.async` split lost alongside cause 3 | 2 |

**1 — the module entry points.** Every `module__*` and `script-module__*` entry. The instance
script goes through the AST state transform; `<script module>` and `.svelte.js` go through the
module text pipeline, and that pipeline gets the dev lowering inside out — it emits
`(await $.track_reactivity_loss($.async_derived(() => p)))()` where upstream emits
`await $.async_derived(async () => (await $.track_reactivity_loss(p))(), 'a', '…')`, i.e. the
instrumentation wraps the *call* instead of the thunk body. Destructured module declarations
are not lowered at all (`const [a, b] = await $.async_derived(() => p)`), and the module
`server` target reads the derived without calling it (`return a` for `return a()`). Adding the
dev arguments to this path would have been invisible, so #2540 did not: the shape above it is
wrong first.

**2 — `var $$d, a, b;`.** rsvelte hoists its own destructuring temp into the component's
top-level `var` list; upstream keeps it local to the `$.run` callback. Present on `client`,
`server` and `client-dev` alike, so it is not dev instrumentation.

**3 and 4 — the ignore comment.** Upstream re-emits the `svelte-ignore` comment inside the
declaration it hoists (`var // svelte-ignore await_waterfall\n a;`); rsvelte drops it. Where the
comment is a block comment on the same line as the declaration, rsvelte does worse than drop it
— it splices it into the async hoist and produces
`$.run([async () => void (/* svelte-ignore await_waterfall */ const a = await …)])`, a `const`
in expression position that no JavaScript parser accepts. Cause 4 is a real bug, found by this
family, and the reason the `block-inline` slot is worth its 14 entries.

**Because of 3, the ignore axis cannot gate what it was added for.** A listed entry suppresses
everything about that entry, so a regression in the ignored form's argument list would not show
here. The assertions that do watch it are
`crates/rsvelte_core/tests/async_derived_dev_args_2540.rs` (exact argument list, three ignore
placements) and `scripts/compat-corpus/await-waterfall-runtime.mjs` (the warning actually
fires, and the ignore actually suppresses it). Clearing cause 3 hands the axis back to this
gate.

**5 — two lowering divergences the axis found incidentally.** A multi-`await` derived loses the
`$.save(…)` upstream wraps every non-final `await` in, and `$derived.by(async () => …)` is
routed through the async-derived hoist (`var a; $.run([…])` plus a `$$promises` blocker) where
upstream emits a plain `const a = $.derived(async () => …)` — rsvelte suspends on a derived
upstream does not.
### `constant-fold` — 8 entries

Four expressions (`'ab'.at(0)`, `(1).toFixed(2)`, `Math.max(1, 2)`,
`Math.max(1, 2).toFixed(0)`) × `client` / `client-dev`, and **one slot**: the
`{@render}` argument. Every other slot in the family passes for all four, and
`server` passes everywhere.

They are not a folding divergence — they are memoisation. Upstream memoises a render
argument when the expression `has_call`, which its `is_pure` makes **false** for a call
whose callee and arguments are all pure, so `{@render row(Math.max(1, 2))}` is emitted
verbatim. rsvelte decides the same question with `render_tag_has_call`
(`client/visitors/render_tag.rs`), a value-level walk that reports any `CallExpression`
anywhere and takes no `context`, so it has no notion of purity and wraps the argument in
a `$.derived_safe_equal`. Both outputs compute the same value; the difference is one
extra signal.

Pre-existing and newly *measured*, not newly introduced: this family is new, and nothing
in the change that added it touches the render-tag path. Two of the four
(`string-literal-call`, `number-literal-call`) were already diverging on the first run of
the family, before any fix in that PR had landed; the other two were masked by the
`has_state` divergence that PR fixed and surfaced with it gone.

They clear when `render_tag_has_call` is given the purity rule `has_call_json`
(`client/visitors/shared/utils.rs`) already implements — which is a change to the
memoisation path, deliberately left out of the folding fix so that a regression in one
cannot be read as the other.

## Burn-down

Re-baseline in the same PR as the fix:

```
cargo build --release -p rsvelte_napi --lib
mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node
node scripts/compat-corpus/matrix/run.mjs --update-baseline
```

`--update-baseline` refuses to run under `--no-fmt` (which counts formatting-only
differences the corpus tolerates) or under a `--families` subset (which would delete every
baseline entry the run did not measure).
