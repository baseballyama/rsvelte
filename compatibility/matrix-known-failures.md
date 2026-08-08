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

## Matrix known failures (`matrix-known-failures.json`, 234 entries)

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

### `comment-slot` — 232 entries

Two sub-clusters with distinct causes: the `.svelte` template seeds below and the
remainder of the `.svelte.(js|ts)` module path (#2399). The class-field relocation
(#2437) cleared entirely.

#### `.svelte` template seeds — 160 entries

One comment inserted at each line boundary inside every `<script>` region of 6 seeds,
across 8 comment kinds. A comment is the one token that may appear between any two other
tokens, so any code path that finds a terminator by scanning bytes rather than lexing
breaks here — #2253 was five such scans in one file.

Classified by comparing the **multiset of comments** in each output:

| what diverges | entries | of which server |
|---|---|---|
| rsvelte drops a comment the official compiler keeps | 100 | 56 |
| the comment survives but lands somewhere else | 32 | 0 |
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
| `legacy-reactive` | 56 |
| `module-script` | 56 |
| `await-block` | 24 |
| `class-private-state` | 8 |
| `class-static-block` | 8 |
| `snippet-render` | 8 |

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

Server still dominates (80 of these 160 — the previous baseline said 82, which no entry
count supports), and its 56 remaining drops are one residual class: a
comment TRAILING the last top-level statement of a script region, which upstream flushes
into the generated component function's parameter list or into a template interpolation
(`$$renderer.push(\`…${$.escape(/* c */ b)}…\`)`). It is 7 line slots × 8 comment kinds.
See `server/ast/comments.rs`.

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
