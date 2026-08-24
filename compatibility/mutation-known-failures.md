# Corpus-seeded mutation fuzz — known failures

Ratchet for `scripts/compat-corpus/mutate-corpus.mjs` (#2281 Gate 3). Shrink-only; two-sided
under `--full` (a sampled run cannot prove an entry is stale, so it checks regressions only).
Re-baseline with `pnpm run corpus:mutate:update`.

**Every current number below was measured under oxfmt 0.64.0.** The code/comment split is *defined* by
what the normalizer absorbs, so these verdicts are only comparable across runs on the same
version — which is why the gate prints the version it used. Re-deriving this baseline from
0.61.0 to 0.62.0 moved the gated bucket from 213 to 525; see "Sensitivity to the normalizer".
The bucket was burned down from 525 to **30**, and `unparseable` from 2 to **0**, on the
14,229-seed corpus. The wave-2 enrolment (#3130) took the seed set to 33,406 and the ratchet to
**168** — `code-mismatch` 160 and `unparseable` **8**. Subsequent fixes reduced that ratchet to
**165** — `code-mismatch` 159 and `unparseable` **6**. The enrolled entries were not regressions:
every one is a pre-existing defect in a repository the corpus did not previously hold,
and the 30 that predate the enrolment all still diverge.

**Six of those entries arrived from shrinking a different ratchet, and that coupling is worth
stating once.** `eligible` here is `manifest ∖ (union of the four output ratchets)` — a seed that
diverges *unmutated* is excluded, because a mutant of it could not attribute anything. So when
the rebase onto `main` took the output ratchets from 759 ids to 601, **158 seeds entered this
gate's population for the first time**, and two of them (`huly`'s
`DocUpdateMessagePresenter` and `ProcessesExtension`) produced divergent mutants on 6
`(id, target)` pairs. A `NEW` divergence here can therefore be a newly *reachable* seed rather
than a regression, and the two are distinguished by asking whether the seed was in an output
ratchet before — not by reading the count. Same shape as `start`/`end` in
[`error-known-failures.md`](error-known-failures.md), where fixing one comparison adds rows to
the other.

## Why this gate exists

When this gate was built the collected corpus was at **0 known failures on all three targets** —
saturated. That did not mean the compiler was correct; it meant that input distribution had
nothing left to teach. So the entries stop being the test set and become a **seed set**: insert
one semantics-preserving comment at a line boundary inside a `<script>` region and require
parity on the mutant.

The enrolment restated the same point one level up. It broke the saturation by *adding inputs*
(the collected ratchets went 0 to 1,977, and to 1,413 once re-measured against a newer `main`),
and this gate then found more defects **in those
same inputs** that the unmutated comparison scores as passing. Growing the population and
perturbing it are not substitutes.

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
many comment-only divergences (**35,992** on the current sweep) against **165** gated ones — ratcheting per id without the
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

## Mutation known failures (`mutation-known-failures.json`, 165 entries)

Full sweep: 34,072 manifest entries, 585 already-diverging unmutated (excluded), **33,487
eligible seeds** → 30,323 mutants → 121,292 comparisons, under oxfmt 0.64.0. 3,164 seeds are
skipped (no mutable `<script>` line boundary).

The `mutation-known-failures.provenance.json` file records 61 entries, one SHA-256 seed-content
hash for each source represented by the failure ratchet. A full sweep reports a changed
hash as re-keyed instead of claiming that the old mutation now passes.

| verdict | entries |
|---|---|
| `code-mismatch` | 159 |
| `unparseable` | **6** |
| `compiler-crash` | 0 |
| `error-mismatch` | 0 |

By target: `client` 59, `client-dev` 54, `server` 26, `server-dev` 26.

### `unparseable` went back to 6 with the enrolment, and that is the entry to burn down first

The six are three units × two targets, and they are **not** a re-opening of #2546 (below): that
cluster was `const h;` from one rewrite, and each of these is a different scan. All three are one
family — a `//` comment that ends up on the same line as the code that followed it, so the rest
of the line is swallowed:

| unit | target | acorn | what got eaten |
|---|---|---|---|
| `huly/…/create-doc/steps/TemplateStep` | `client`, `client-dev` | `Unexpected token (66:2)` | `// svelte-ignore ….then((res) => {` — a chained `.then` |
| `ha-fusion/src/lib/Sidebar/History` | `client`, `client-dev` | `Unexpected token (130:4)` | `// } c.catch((error) => {` — a chained `.catch` |
| `svelte-put/packages/toc/src/toc.svelte.js` | `server`, `server-dev` | `Unexpected token (13:6)` | a class field split into `id =;` and its initializer — the `.svelte.(js\|ts)` path `AGENTS.md` records as unaudited |

Two of the three put a comment where a **continuation** was expected, which is the same
"where does this construct end" question as #2253, one line lower. The third is a different
pipeline. `unparseable` is listed here rather than fixed only because the enrolment PR's job was
to enrol; the rule that a compiler may never emit non-JavaScript has not been relaxed.

### `unparseable` was 0 before the enrolment — [#2546](https://github.com/baseballyama/rsvelte/issues/2546) closed

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
(3,730–3,861) and the rates are directly comparable. The gate prints this table itself, so it
cannot drift from the ratchet it describes:

| comment kind | findings | mutants | per 1,000 |
|---|---|---|---|
| `block-with-paren` (`/* ) c */`) | 30 | 3,754 | 8.0 |
| `line-with-semi` (`// ; c`) | 29 | 3,822 | 7.6 |
| `line-with-brace` (`// } c`) | 24 | 3,861 | 6.2 |
| `line-with-paren` (`// ) c`) | 24 | 3,829 | 6.3 |
| `line` (`// c`) | 20 | 3,780 | 5.3 |
| `block` (`/* c */`) | 18 | 3,730 | 4.8 |
| `svelte-ignore` | 12 | 3,773 | 3.2 |
| `block-with-brace` (`/* } c */`) | 8 | 3,774 | 2.1 |

**Delimiter-carrying kinds: 5.6 per 1,000. Plain comments: 5.1. Ratio 1.10×.**

The ratio has been measured at 2.81× (oxfmt 0.61), 1.30× (0.62), 1.66× (0.62, after the
invalid-JS burndown), 1.38× after the inspect empty-statement fix, **0.92×** on the enrolled
corpus, **1.13×** after the rebase onto `main`, and **1.10×** after the latest fixes. The rebase
moved it back across 1.0 with no change to this gate at all, only to which seeds are eligible and which divergences `main`
had already fixed. That is the sharpest available demonstration of the next sentence. It is not a stable property of the compiler: the earlier moves were the normalizer
changing what it absorbs and delimiter-signature fixes removing findings from the numerator by
construction, and this one is a change of population. Read it as a description of the current
residue, not as a measure of the mechanism's importance — the doc has said so at every previous
value, and this is the first one that would have supported the opposite conclusion.

**The claim this table used to carry is now falsified, and by a change of inputs alone.** At
14,229 seeds the two plain kinds were at 0 findings each, and the doc concluded that "every
surviving code divergence in this bucket involves a delimiter-carrying comment". On 33,487
seeds `line` is at 20 and `svelte-ignore` at 12 — and `svelte-ignore` carries no delimiter at
all yet accounts for one of the three `unparseable` units. A plain comment that lands on a line
where a *continuation* was expected breaks the same scans a delimiter does; the delimiter was
never the mechanism, only the cheapest way to reach it.

The delimiter share is the #2253 signature: a text-level rewrite locates a terminator by
scanning bytes instead of lexing, so a `}` / `)` / `;` inside a comment is read as code. #2283
consolidated five such scans behind `shared/js_scan.rs::skip_opaque`.

The paren mechanism recorded here — official emitting `() => (items())` where rsvelte emits
`() => items()`, with the two agreeing on the unmutated seed — was measured as **353 of 525** of
first-differences against the 525-entry baseline. That figure is historical and does not carry
over.

### Behavioral residue is no longer zero

At 14,229 seeds the residue was entirely cosmetic — empty-statement placement and optional-chain
parenthesisation — and this section said so. The enrolled corpus reopens two behavioral classes
that were "all gone" against the smaller seed set, so the sentence is retracted rather than
edited.

The 160 `code-mismatch` entries, keyed by comparing the two normalized outputs whole (not by the
first differing line, which over-reports parenthesisation):

| n | class | behavioral? |
|---|---|---|
| 88 | parenthesisation only | no |
| 28 | empty-statement placement only | no |
| 24 | more than one of the above at once, or unclassified | no (inspected sample) |
| 18 | **a `$.get()` read is lost** — `{"aria-hidden": labelled ? …}` where official emits `$.get(labelled)` | **yes: reactivity** |
| 2 | **the `$.rest_props` initializer vanishes** — `var rest_excludes = new Set([…])` is simply absent | **yes: attributes silently disappear** |

Both behavioural classes are **byte-for-byte the same entries** they were before the rebase —
the same nine carbon components × two client targets and the same `cnblocks/…/vercel` pair — so
the movement in the two cosmetic rows is the population changing, not these two defects.

The 18 are nine carbon-components-svelte icon components × two client targets, all the same
`$.set(attributes, {…})` spread. The 2 are `cnblocks/src/lib/svgs/vercel` and are #2347's shape
exactly — the bug this gate was built on, on an input the corpus did not hold when it was fixed.
That is the strongest available statement about what enrolment bought: a closed defect class
reappearing on new seeds is evidence about *coverage*, not about the fix.

### By source repository

`huly` 88, `carbon-components-svelte` 18, `open-webui` 16, `svelte` 7, `flowbite-svelte` 4,
`layerchart` 4, `networking-toolbox` 4, `powertable` 4, `svelte-lexical` 4, `svelte-spa-router` 4,
`cnblocks` 2, `ha-fusion` 2, `runed` 2, `svelte-put` 2, `threlte` 2, `trakt-web` 2,
`svelte.dev` 1.

**`huly` alone is 53% of the ratchet**, on a corpus where it is one repository of 103. That is
the concentration the old six-repository list could not show, and it is worth reading as a
statement about the *seed distribution* rather than about huly: it is a large Svelte-4-era
application, so it carries far more of the legacy `$:` / chained-promise shapes these scans
mis-locate than a modern component library does.

**Two entries are `runed`, and that is the reason this table is worth reading.** `runed` was one
of two corpus submodules absent from the tree during an earlier attempt at this re-baseline.
`collect.mjs` skips a missing source with a warning and exits 0, so the run measured 14,035
entries and looked complete — and `--update-baseline` would have deleted both of this as fixed
while it still diverges, after which CI would have reported it as new. The
`MIN_FULL_CORPUS_ENTRIES` floor cannot catch that: 14,035 cleared the 12,000 lower bound of the
day. **The enrolment makes that hazard larger, not smaller**: the floor is now 30,000 against
34,007 collected entries, so the margin a silently-missing source has to eat before the floor
notices is 4,007 entries — about 12%, which the largest source alone exceeds. Only 2 of the 104
corpus sources are marked `required`.

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
of 14,229 entries are currently excluded on that basis — the collected corpus is saturated.
