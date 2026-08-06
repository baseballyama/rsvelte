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

## Matrix known failures (`matrix-known-failures.json`, 600 entries)

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

### `comment-slot` — 348 entries

One comment inserted at each line boundary inside every `<script>` region of 6 seeds,
across 8 comment kinds. A comment is the one token that may appear between any two other
tokens, so any code path that finds a terminator by scanning bytes rather than lexing
breaks here — #2253 was five such scans in one file.

Classified by comparing the **multiset of comments** in each output:

| what diverges | entries | of which server |
|---|---|---|
| rsvelte drops a comment the official compiler keeps | 268 | 224 |
| the comment survives but lands somewhere else | 52 | 0 |
| rsvelte emits a comment more than once | 28 | 24 |
| **anything other than the comment itself** | **0** | — |

The last row is the important one: **no generated mutant changes rsvelte's codegen
semantics.** The mutation is semantics-preserving and so is the output; what diverges is
comment reproduction only. That bounds the severity of this backlog — it is an output-
fidelity gap, not a correctness gap — and it is why this ratchet starts large without
blocking the gate from being useful on day one.

By seed:

| seed | entries |
|---|---|
| `class-static-block` | 90 |
| `class-private-state` | 82 |
| `legacy-reactive` | 72 |
| `module-script` | 72 |
| `await-block` | 24 |
| `snippet-render` | 8 |

Server dominates (248 of 348) for a known structural reason: the SSR path reconstructs
statements it cannot carry comments through. See `server/ast/comments.rs` and the
comment-carry-over work in #2312, which is the burn-down vehicle for the 224 server drops.

### `comment-slot` module path (`.svelte.(js|ts)`) — 240 entries, all #2399

Added with the module seeds that gave this family its `.svelte.(js|ts)` cases. Every one of
these 240 is the **same open bug — [#2399](https://github.com/baseballyama/rsvelte/issues/2399):
official drops a Program-level comment in the module path and rsvelte keeps it.** They are
listed as *expected to shrink when #2399 lands*, not as accepted behaviour. Do not treat this
block as a specification of rsvelte's output.

Classified mechanically, not by eye: for each entry the two normalized outputs are diffed as
line multisets, and an entry qualifies only when nothing is missing from rsvelte's side and
every extra line is a comment. The classifier is the same comparison the gate makes, run over
the gate's own artifacts.

One correction this measurement forces, because #2399's framing depends on it: **official does
not drop *every* Program-level comment.** Over the 192 generated module cases it drops in
**80** and preserves in **112** — position-dependent, and uniform across all 8 comment kinds
(7 drops each). A fix built on "drop them all" would be wrong in 112 of 192 positions; the
correct fix reproduces a position rule.

### `comment-slot` class-field comment relocation — 10 entries, all #2437

`module-class-state__L02__*` for the five **line**-comment kinds (`line`, `line-with-brace`,
`line-with-paren`, `line-with-semi`, `svelte-ignore`) on `client` and `client-dev`. Block
comments at the same slot are unaffected.

**This is not a preservation gap and must not be closed against #2399.** Both compilers *keep*
the comment. rsvelte **relocates** it: a line comment that precedes a rune-initialized class
field is moved off its own line and into the field's initializer position.

```js
// official                        // rsvelte (client-dev)
export class Counter {             export class Counter {
	// c                            	#n = // c
	#n = $.state(0);                	$.state(0);
```

on `client` it lands as a trailing comment instead: `#n = $.state(0); // c`.

**rsvelte's output here is wrong, not accepted.** These entries are parked so the module seeds
could land; they are tracked by
[#2437](https://github.com/baseballyama/rsvelte/issues/2437) and clear when it does.

Two facts that make this a shipped bug rather than a matrix artefact, and that belong with any
attempt to fix it:

- **It reproduces through `compile`, not only `compileModule`** — the same class inside a
  `<script module>` block of a `.svelte` component diverges identically. So it is neither
  module-specific nor a consequence of this family's `compileModule` dispatch.
- **The collected corpus cannot see it even where the shape occurs**, because `verify.mjs`
  invokes `ast_equiv_batch` with empty argv and `CommentPolicy::Ignore` therefore applies
  (#2424, documented by #2436). A comment-position divergence is scored a pass corpus-wide, so
  this generated family is currently the only place in the project where one is observable.

## Burn-down

Re-baseline in the same PR as the fix:

```
cargo build --release -p rsvelte_napi --lib
mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node
node scripts/compat-corpus/matrix/run.mjs --update-baseline
```

`--update-baseline` refuses to run under `--no-fmt` (which counts formatting-only
differences the corpus tolerates) or under a `--families` subset (which would delete every
baseline entry the run did not measure).
