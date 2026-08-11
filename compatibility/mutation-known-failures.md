# Corpus-seeded mutation fuzz — known failures

Ratchet for `scripts/compat-corpus/mutate-corpus.mjs` (#2281 Gate 3). Shrink-only; two-sided
under `--full` (a sampled run cannot prove an entry is stale, so it checks regressions only).
Re-baseline with `pnpm run corpus:mutate:update`.

**Every number below was measured under oxfmt 0.62.0.** The code/comment split is *defined* by
what the normalizer absorbs, so these verdicts are only comparable across runs on the same
version — which is why the gate prints the version it used. Re-deriving this baseline from
0.61.0 to 0.62.0 moved the gated bucket from 213 to 525; see "Sensitivity to the normalizer".
The bucket has since been burned down from 525 to **36**, and `unparseable` from 2 to **0**.

## Why this gate exists

The collected corpus is at **0 known failures on all three targets** — it is saturated. That
does not mean the compiler is correct; it means this input distribution has nothing left to
teach. So the 14,138 entries stop being the test set and become a **seed set**: insert one
semantics-preserving comment at a line boundary inside a `<script>` region and require parity
on the mutant.

Two live bugs came out of the first sweep, neither reachable from the unmutated corpus. Both
are now **fixed and closed**, and the sweep reproduces neither — `compiler-crash` and
`error-mismatch` are both at 0:

- **#2351** — a comment containing `}`, `)` or `;` inside a `$:` block body **aborted the client
  compiler with SIGSEGV**. Not an exception: the host process died.
- **#2347** — a `//` comment before the closing brace of a `$props()` pattern swallowed the
  `$.rest_props(...)` initializer. The output parsed, so nothing caught it; at runtime every
  forwarded attribute silently disappeared.

The gate keeps the child-process isolation and the `error-mismatch` verdict regardless: they
are what made those two findings attributable, not artefacts of them.

## What is gated, and what is only counted

A divergent mutant is classified by whether the difference survives normalizing comments,
whitespace and trailing commas away:

| verdict | in this ratchet | meaning |
|---|---|---|
| `code-mismatch` | yes | the generated **code** changed because a comment moved |
| `compiler-crash` | yes | rsvelte aborted the process on the mutant |
| `error-mismatch` | yes | exactly one compiler rejected the mutant |
| `unparseable` | yes | rsvelte emitted JavaScript that does not parse |
| `comment-mismatch` | **no** | the comment was dropped, duplicated or relocated, or a line broke differently |

The split is the difference between a gate and a backlog dump. The full sweep produces
**12,910** comment-only divergences against **36** code ones — ratcheting per id without the
split would mean a 13,000-entry file that churns on every submodule bump and buries the class
that matters. Comment fidelity is already ratcheted per id by Gate 2
(`matrix-known-failures.md`), on **generated** seeds that do not move when a submodule bumps,
which is where a stable per-id ratchet belongs.

Trailing commas are normalized away because oxfmt adds one exactly when it breaks a construct
across lines, so a comment that changes the line-breaking decision changes the comma too.
Ignoring that took the code class from 45 apparent findings to 2 real ones in the first
300-seed sample. A comma preceded by another comma is left alone — that is array elision,
which is semantically real.

Quote style is normalized for the same reason, and it survives only on pairs oxfmt could not
parse. It was measured to reclassify **0 of 213** entries under oxfmt 0.61 and has not been
re-measured under 0.62, so it is in for honest reporting rather than to change a verdict: the first difference
the gate prints must be the reason for the verdict, and before this a reviewer could see
`import 'x'` vs `import "x"` and dismiss a real finding sitting further down the same file.

## Mutation known failures (`mutation-known-failures.json`, 36 entries)

Full sweep: 14,138 seeds → 12,166 mutants → 36,498 comparisons, under oxfmt 0.62.0.

The `mutation-known-failures.provenance.json` file records 21 entries, one SHA-256 seed-content
hash for each source represented by the failure ratchet. A full sweep reports a changed
hash as re-keyed instead of claiming that the old mutation now passes.

| verdict | entries |
|---|---|
| `code-mismatch` | 36 |
| `unparseable` | **0** |
| `compiler-crash` | 0 |
| `error-mismatch` | 0 |

By target: `client` 19, `client-dev` 11, `server` 6.

### `unparseable` is now 0 — [#2546](https://github.com/baseballyama/rsvelte/issues/2546) closed

The two parked entries (`svelte-calendar/.../SvgThing__m0__block-with-brace.svelte` on `client`
and `client-dev`, where rsvelte emitted `const h;`) are gone, along with the wider invalid-JS
cluster the full sweep surfaced: **16 unparseable at `d88546a7`, 10 after #2639/#2642, 0 after
#2619/#2626**. Nine distinct seeds, closed by four PRs.

That progression is also the positive control for reading the current 0 — the same counter was
non-zero twice on the same day, so this zero is a measurement rather than an instrument that
cannot move.

Two of those PRs are worth separating, because each looks ineffective under the other's gate.
#2619 changed 8 real corpus files and **0** mutation seeds; #2626 changed **0** real files and 5
of the remaining seeds. A `0/0/0` corpus delta meant the byte-identity corpus could not express
the shape, not that the change did nothing.

**One shape in this family remains unreachable by this gate at any corpus size**: a delimiter
inside an ordinary string literal reproduces the same defect with no comment present, and the
operator inserts comments and only comments. See `gate-coverage.md` row 20a.

### The delimiter is one mechanism, no longer the dominant one

Each comment kind is chosen with equal probability, so the per-kind mutant counts are uniform
(1,460–1,556) and the rates are directly comparable. The gate prints this table itself, so it
cannot drift from the ratchet it describes:

| comment kind | findings | mutants | per 1,000 |
|---|---|---|---|
| `line-with-semi` (`// ; c`) | 8 | 1,532 | 5.2 |
| `block-with-paren` (`/* ) c */`) | 7 | 1,474 | 4.7 |
| `block-with-brace` (`/* } c */`) | 7 | 1,535 | 4.6 |
| `block` (`/* c */`) | 6 | 1,518 | 4.0 |
| `line-with-paren` (`// ) c`) | 5 | 1,562 | 3.2 |
| `line-with-brace` (`// } c`) | 3 | 1,558 | 1.9 |
| `line` (`// c`) | 0 | 1,520 | 0.0 |
| `svelte-ignore` | 0 | 1,467 | 0.0 |

**Delimiter-carrying kinds: 3.3 per 1,000. Plain comments: 2.0. Ratio 1.66×.**

The ratio has now been measured at 2.81× (oxfmt 0.61), 1.30× (0.62), and 1.66× (0.62, after the
invalid-JS burndown). It is not a stable property of the compiler: the first move was the
normalizer changing what it absorbs, and the second was fixing delimiter-signature defects,
which removes findings from the numerator by construction. Read it as a description of the
current residue, not as a measure of the mechanism's importance.

The two plain kinds are now at **0 findings each**, so every surviving code divergence in this
bucket involves a delimiter-carrying comment.

The delimiter share is the #2253 signature: a text-level rewrite locates a terminator by
scanning bytes instead of lexing, so a `}` / `)` / `;` inside a comment is read as code. #2283
consolidated five such scans behind `shared/js_scan.rs::skip_opaque`.

The paren mechanism recorded here — official emitting `() => (items())` where rsvelte emits
`() => items()`, with the two agreeing on the unmutated seed — was measured as **353 of 525** of
first-differences against the 525-entry baseline. That figure is historical and does not carry
over; the section below re-derives the split against the 36.

### What the 36 are

The gate prints one first-difference line per **regression**, so a passing run prints none. To
get all 36, empty the ratchet, run `--full --max-print 40`, and restore it — which needs no
artifacts and no re-compile. Classifying every entry by the first rule that matches:

| class | entries | example (official → rsvelte) |
|---|---|---|
| empty-statement / `;` placement | 16 | `export default class {};` → `export default class {}` |
| optional-chain parenthesisation | 9 | `(e?.target)?.closest(…)` → `e?.target?.closest(…)` |
| missing `$.get` on a reactive read | 3 | `() => $.get(circles)` → `() => circles` |
| `$$DOUBLE_SEMI$$` sentinel reaches the output | 3 | `;;` → `void "$$DOUBLE_SEMI$$";` |
| extra legacy prologue | 2 | *(absent)* → `$.legacy_pre_effect_reset();` |
| `$props()` destructure left in the output | 2 | *(absent)* → `let { visible, class: className } = $props();` |
| `$.snapshot` second argument dropped | 1 | `$.snapshot(arr, true)` → `$.snapshot(arr)` |

`() => (items())` — the shape the 353 counted — does **not** appear among the 36 at all. The 9
parenthesisation entries are a different one: a parenthesised optional-chain link. So the
mechanism that dominated the 525 is not merely a smaller share now, it is absent from the
residue, and quoting any paren share of the current bucket from the historical number would be
wrong in kind rather than in magnitude.

The `;` bucket splits as 6 × a trailing `;` after a class body or IIFE that rsvelte omits, 5 ×
rsvelte emitting more empty statements than official, 3 × fewer, 1 × an empty statement in a
`switch` case, 1 × other placement.

**"Known failure" is not "accepted output" here, and the table is what separates the two.** The
first two classes — 25 of 36 — are cosmetic: a redundant paren and an empty statement change no
behaviour. The remaining 8 do. A missing `$.get` is lost reactivity; a leaked `$$DOUBLE_SEMI$$`
is an internal marker shipped to users; a `$props()` destructure surviving into the compiled
module references a rune that does not exist at runtime. Anyone burning this bucket down should
start at the bottom of the table, not the top.

Two things this classification does not establish. It is the **first** difference per entry, so
an entry counted as cosmetic may carry a behavioural one further down the same file — the split
bounds the cosmetic share from below, not the behavioural share from above. And each row is a
description of the output, not a diagnosis: no site in the compiler has been attributed to any
of these seven classes.

### By source repository

`svelte` 17, `svelte.dev` 4, `flowbite-svelte` 3, `layerchart` 3, `powertable` 3, `layercake` 2,
`runed` 2, `svelte-sonner` 2.

**Two of the 36 are `runed`, and that is the reason this table is worth reading.** `runed` was
one of two corpus submodules absent from the tree during the first attempt at this
re-baseline. `collect.mjs` skips a missing source with a warning and exits 0, so the run
measured 14,035 entries and looked complete — and `--update-baseline` would have deleted both of
these as fixed while they still diverge, after which CI would have reported them as new. The
`MIN_FULL_CORPUS_ENTRIES` floor cannot catch that: 14,035 clears a 12,000 lower bound. Only 2
of the 36 corpus sources are marked `required`.

### Sensitivity to the normalizer

Re-deriving this baseline from oxfmt 0.61.0 to 0.62.0 took the gated bucket from **213 to
525** — it grew, rather than shrinking as a strictly-more-normalizing formatter would suggest.

That was measured directly rather than inferred. Holding the compiler and the corpus fixed and
varying only the normalizer, over the 193 seeds behind the newly-added entries:

| | oxfmt 0.61.0 | oxfmt 0.62.0 |
|---|---|---|
| `match` | 331 | 45 |
| `comment-mismatch` | 244 | 146 |
| `code-mismatch` | 4 | 388 |

Same seeds, same 193 mutants, same 579 comparisons. So **384 of the 388 additions are the
normalizer**, not the 13 intervening commits on `main` and not the corpus growing by 104
entries. 0.61 was collapsing redundant parentheses on *both* sides, which made a real rsvelte
divergence compare equal; 0.62 preserves them and the divergence becomes visible. The larger
ratchet is the more honest one.

The direction is the trap worth remembering: a normalizer that absorbs more can *expose* more,
because what it stops rewriting on the expected side is what the actual side was being
compared against.

## Stability of the ratchet

Ids are `<corpus id with __m<n>__<kind> before the extension> [verdict] (target)`.

- The mutant a seed contributes is chosen from **that seed's own hash**, not from its index in
  the manifest, so adding or removing a corpus entry does not reshuffle every other entry's
  mutants.
- The tag goes **before** the extension so the compiler still receives a filename ending in
  `.svelte` / `.svelte.js` / `.svelte.ts`. Appending it instead produced 9 spurious
  `error-mismatch` entries that vanished when the filename was made valid — dev mode bakes the
  filename into its output, and an unrecognised extension selects paths the real pipeline never
  takes.
- The tag carries the mutant INDEX, not the slot's line. `n` and the comment kind derive from
  the seed id alone; the line does not, so keying on it made an edit anywhere in a seed file
  rewrite every entry for that file — surfacing as a regression and a staleness at once, for a
  divergence that had not changed.
- Seeds already listed in `known-failures.<target>.json` are excluded: they diverge before
  anything is inserted, so a divergent mutant of one is not attributable to the mutation. **0**
  of 14,138 entries are currently excluded on that basis — the collected corpus is saturated.
