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

## Matrix known failures (`matrix-known-failures.json`, 641 entries)

Partition of `matrix-known-failures.json` by family: `4 + 172 + 8 + 24 + 60 + 82 + 180 + 111`

### `binding-position` — 4 entries

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

### `comment-slot` — 172 entries

All remaining entries are generated `.svelte` template seeds. The class-field relocation
(#2437) and the module-path residue (#2399) cleared entirely.

#### `.svelte` template seeds — 172 entries

One comment inserted at each line boundary inside every `<script>` region of 7 seeds,
across 8 comment kinds. A comment is the one token that may appear between any two other
tokens, so any code path that finds a terminator by scanning bytes rather than lexing
breaks here — #2253 was five such scans in one file.

By seed:

| seed | entries |
|---|---|
| `legacy-reactive` | 36 |
| `module-script` | 40 |
| `await-block` | 32 |
| `class-private-state` | 16 |
| `class-static-block` | 16 |
| `snippet-render` | 16 |
| `const-fold-line-continuation` | 16 |

The matrix reports output parity, so these entries remain an output-fidelity backlog rather
than a statement about runtime semantics. Their grouping is deliberately by source seed; the
comparison does not retain a stable enough failure-cause classification to support a finer
partition in this document.

Partition of `matrix-known-failures.json` entries under `comment-slot/` by what diverges: `172`

Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `36 + 40 + 32 + 16 + 16 + 16 + 16`

### `each-collection` — 0 entries

Every collection shape now matches across all targets.

Partition of `matrix-known-failures.json` entries under `each-collection/` by collection: `0`

### `keyword-regex` — 24 entries

Not the family's own axis, and not its author's doing: these appear because this PR added
warning-**code** comparison to the gate, and `keyword-regex` is the one pre-existing family whose
inputs reach a warning. All 18 are one cause on all three targets —
`perf_avoid_nested_class` never fires for a `class` declared inside a legacy `$:` reactive
statement. The six cases are the `extends` row against every host and body that puts the class
there (`legacy-reactive`, `legacy-reactive-block`, and the four `body-*` rows, which run against
`legacy-reactive` by construction).

Partition of `matrix-known-failures.json` entries under `keyword-regex/` by target: `6 + 6 + 6 + 6`

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

### `directive-element` — 82 entries

19 directive kinds × 13 element kinds × 2 modes (runes / legacy), 1482 comparisons. Every one
of these 62 entries is a **live rsvelte defect**, not accepted behaviour; none was known before
the family existed. They are listed so the ratchet can hold the line while they are burned down.

The single most useful fact about the set is where it is **not**: zero entries on
`regular-element`, `regular-input`, `component` and `each-keyed-element`. All 62 sit on a
`<svelte:*>` special element. Directive handling on ordinary elements and components agrees with
official across every kind and both modes; the special elements are where per-parent handling has
drifted from upstream's one predicate per directive.

Partition of `matrix-known-failures.json` entries under `directive-element/` by verdict and host: `24 + 2 + 12 + 12 + 6 + 6 + 20`

| verdict | host | entries | cause |
|---|---|---:|---|
| `error-mismatch` | `svelte-body` | 24 | `bind:value`, getter/setter `bind:`, `let:`, and a spread attribute each diverge on both modes and all targets. |
| `js-mismatch` | `svelte-body` | 2 | Legacy-mode `bind:this` fails to make the target a `mutable_source`. |
| `error-code-mismatch` | `svelte-document` | 12 | `bind:value` rejected as `bind_invalid_name`; official says `bind_invalid_target`. |
| `error-code-mismatch` | `svelte-window` | 12 | same. |
| `error-mismatch` | `svelte-element` | 6 | `animate:` outside a keyed `{#each}` is accepted (`animation_invalid_placement`). |
| `error-mismatch` | `svelte-component` | 6 | `on:click\|preventDefault` is accepted (`event_handler_invalid_component_modifier`). |

The `js-mismatch` rows are `client` and `client-dev` only. Development SSR now matches the
identifier-tag path on every generated `svelte-element` directive row, while the server target
emits nothing for a transition on either compiler.

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

### `bind-setter` — 0 entries

All 189 generated comparisons now match. #2484's three special-element dev setter cases are
covered by the direct regression tests as well as this zero-residue matrix family.
### `removed-statement-comment` — 180 entries

The family crosses statements the SERVER transform removes (`$effect`, `$effect.pre`,
`$effect.root`, `$inspect`) with the comment slot (leading / interior / trailing), 6 comment
kinds, 3 hosts (`compileModule`, the instance script's top level, one function deep) and
whether a statement survives after the removed one. 396 cases, 1188 comparisons; the fix that
landed with it cleared 79 of them (403 → 324, all on `server`).

Every remaining entry is in the server tail cluster below.

| entries | target | cluster | issue |
|---|---|---|---|
| 66 | `server` | `instance-top` × `succ-none` only: the removed statement is the last one in the script, so the orphaned comments have no anchor region to be re-homed onto. Upstream flushes them at the end of the enclosing function body; rsvelte's synthesized component-fn body is location-less, so esrap's closing `flush_comments_until` is a no-op | [#2716](https://github.com/baseballyama/rsvelte/issues/2716) |
Partition of `matrix-known-failures.json` entries under `removed-statement-comment/` by
cluster: `66`

**[D].** It was reduced to a hand-written repro outside the family and measured against the
pinned official compiler.

Note the enrolment cost, because it is real: a ratchet entry suppresses everything about the
entry it lists, so these 66 ids are now blind to any *further* regression on the same shapes
until their issues are fixed.

---

### `async-derived` — 111 entries

Added by #2540. Read the size as a **disclosure**, not a regression: not one of these 111 was
reachable by any gate in the repo before this family existed, because every harness compiles
with a fixed `{ generate, dev, filename }` and `$derived(await …)` is an `experimental_async`
compile error without `experimental.async`. The shape occurs 0 times in the 14k-entry corpus
and would occur 0 times in a 140k-entry one. This family is the first to make a compile
**option** an axis (`generate.mjs`'s `options`, merged in `run.mjs`), which is what turns the
shape from unreachable into measured.

The one thing #2540 itself fixed — the `label` / `location` arguments `$.async_derived` carries
in dev — is *not* in this list; the rows that isolate it (`instance__identifier__none`,
`instance__multi-declarator__none`, all three targets) pass. The remaining rows are grouped by
entry point because one generated case can expose more than one lowering difference.

This change clears all 20 instance `$derived.by(async …)` rows: five comment
slots across all four targets. The eight remaining `script-module` rows with
that declaration shape remain module-lowering differences; they are not hidden
by the fixed instance rows.

Partition of `matrix-known-failures.json` entries under `async-derived/` by cause: `111`

| entry point | entries |
|---|---:|
| instance | 81 |
| module | 5 |
| script module | 25 |
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
