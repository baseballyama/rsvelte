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

## Matrix known failures (`matrix-known-failures.json`, 532 entries)

Partition of `matrix-known-failures.json` by family: `4 + 316 + 8 + 24 + 180`

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

### `comment-slot` — 316 entries

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

Partition of `matrix-known-failures.json` entries under `comment-slot/` by what diverges: `80 + 32 + 100 + 0 + 104`

Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `56 + 28 + 24 + 24 + 24 + 24 + 8 + 8 + 8 + 8 + 104`

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
