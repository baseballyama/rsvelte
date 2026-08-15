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

The **verdict is part of the key**, and three of them can appear: `js-mismatch` (the
difference survives comment + whitespace normalization), `comment-mismatch` (it does not),
and `output-unparseable` (acorn rejects what rsvelte emitted, whatever the bytes say).
None of the three is more tolerated than another — every one is ratcheted two-sided. The
split exists because a listed entry suppresses everything its key cannot tell apart: under
one flat `js-mismatch`, an id whose comments already diverge absorbs a later code
regression on that id for free. That is not hypothetical — every comment carrier in
`opaque-keyword` diverges on comment placement, so re-breaking #2986 would have reproduced
an already-listed key on the very cases written to catch it.

## Matrix known failures (`matrix-known-failures.json`, 524 entries)

Partition of `matrix-known-failures.json` by family: `4 + 172 + 8 + 24 + 180 + 136`

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

All remaining entries are `.svelte` template seeds. The `.svelte.(js|ts)` module-path
cluster is now empty: location-less Programs discard their top-level and EOF comments while
located nested bodies can still resynchronize the cursor, matching esrap.

The current partition by target is `26 + 26 + 64 + 56` for `client`, `client-dev`,
`server`, and `server-dev`. By seed:

| seed | entries |
|---|---:|
| `await-block` | 32 |
| `class-private-state` | 16 |
| `class-static-block` | 16 |
| `const-fold-line-continuation` | 16 |
| `legacy-reactive` | 36 |
| `module-script` | 40 |
| `snippet-render` | 16 |

Of these, rsvelte drops the injected comment in 152 entries, moves it in 16, and keeps or
duplicates one official drops in 4. Comparing normalized non-comment lines finds no
codegen-semantic divergence in this cluster. A comment is the one token that may appear
between any two other tokens, so the matrix crosses eight comment kinds with every line
boundary instead of relying on published-code frequency.

Partition of `matrix-known-failures.json` entries under `comment-slot/` by what diverges: `152 + 16 + 4`

Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `32 + 16 + 16 + 16 + 36 + 40 + 16`

The location-less cursor port clears 144 entries without adding a failure: all 96 trailing
module-path rows (`module-class-state`, `module-rune-exports`, and
`module-ts-extension`, eight kinds × four targets each), plus 48 leading `<script module>`
rows on `server` and `server-dev`. The latter needed the generated component body to inherit
the instance-script region while the outer Program remained location-less.

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

### `param-pattern` — 0 entries

Parameter defaults and computed keys now contribute their enclosing reactive dependencies.

Partition of `matrix-known-failures.json` entries under `param-pattern/` by shape: `0`

### `directive-element` — 0 entries

All 1,976 generated comparisons now match across every directive, special-element host, mode,
and target.

Partition of `matrix-known-failures.json` entries under `directive-element/` by verdict and host: `0`

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

### `async-derived` — 0 entries

Partition of `matrix-known-failures.json` entries under `async-derived/` by cause: `0`

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

### `opaque-keyword` — 136 entries

The family generalizes #2986: a token the transforms scan for **raw**, carried inside a
region where it is text rather than code, crossed with the construct whose boundary a scan
has to find and with both compiler entry points. Its own motivating defect passes — the
class-header scan is lexical now — and what is listed is what it found on the way.

Partition of `matrix-known-failures.json` entries under `opaque-keyword/` by cause: `48 + 48 + 40`

Every listed entry is a `module` (`compileModule`) case except the 20 `instance` ones in
the third cluster. The `class`, `constructor` and `arrow` keyword rows are clean on every
carrier and host, which is what says the class-header fix is complete rather than merely
present.

**48 — `derived` × {`line-comment`, `block-comment`, `string`, `template`} × the three
non-class hosts, all four targets (#2987).** The text `$derived(` occurring anywhere it is
not code stops the *real* `$derived(…)` later in the module from being lowered at all: the
rune call survives verbatim, so the emitted module references a global `$derived` and
throws at import. The output **parses**, which is why the parse oracle is green on all 48 —
only output equality reports it. `$state(` in the same carriers does not reproduce, so this
is the `$derived` path specifically.

**48 — `derived` / `state` × `regex` × all six hosts, all four targets (#2988).** The
opposite direction: a regex literal whose body contains rune-call text is itself rewritten,
`/$derived(x)/` → `/$.derived(() => x)/` and `/$state(x)/` → `/$.state($.proxy(x))/` on the
client, `/x/` on the server. Three different regular expressions, none of them the one that
was written. `/$derived(x)/` is an ordinary regex (`$` anchors, `(x)` captures), not a
contrived spelling. `skip_opaque` already tells a regex from a division; the rewriters that
decide *where a rune call starts* do not consume it.

**40 — any keyword × {`line-comment`, `block-comment`} × `between-classes` × both entry
points × `client` and `client-dev` (#2990).** A comment between two classes that both carry
rune fields: official drops it, rsvelte keeps it. The keyword content is irrelevant — all
five keyword rows reproduce identically — so it is a property of the slot. The direction is
the unusual one (rsvelte's output is the more faithful), and it needs the second class's
body to be *rebuilt*: with no rune fields in it, the same input matches. `server` and
`server-dev` match throughout.

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
