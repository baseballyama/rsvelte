# Corpus-seeded mutation fuzz — known failures

Ratchet for `scripts/compat-corpus/mutate-corpus.mjs` (#2281 Gate 3). Shrink-only; two-sided
under `--full` (a sampled run cannot prove an entry is stale, so it checks regressions only).
Re-baseline with `pnpm run corpus:mutate:update`.

**Every number below was measured under oxfmt 0.62.0.** The code/comment split is *defined* by
what the normalizer absorbs, so these verdicts are only comparable across runs on the same
version — which is why the gate prints the version it used. Re-deriving this baseline from
0.61.0 to 0.62.0 moved the gated bucket from 213 to 525; see "Sensitivity to the normalizer".

## Why this gate exists

The collected corpus is at **0 known failures on all three targets** — it is saturated. That
does not mean the compiler is correct; it means this input distribution has nothing left to
teach. So the 14,131 entries stop being the test set and become a **seed set**: insert one
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
**13,758** comment-only divergences against **525** code ones — ratcheting per id without the
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

## Mutation known failures (`mutation-known-failures.json`, 525 entries)

Full sweep: 14,129 seeds → 12,116 mutants → 36,348 comparisons, under oxfmt 0.62.0.

| verdict | entries |
|---|---|
| `code-mismatch` | 523 |
| `unparseable` | 2 |
| `compiler-crash` | 0 |
| `error-mismatch` | 0 |

By target: `client-dev` 222, `client` 220, `server` 83.

### The two `unparseable` entries — [#2546](https://github.com/baseballyama/rsvelte/issues/2546)

`svelte-calendar/src/lib/docs/SvgThing__m0__block-with-brace.svelte` on `client` and
`client-dev`: rsvelte emits `const h;`, which is a syntax error, where official compiles the
mutant fine. **rsvelte's output here is wrong, not accepted** — these are parked so the gate
can land, and they clear when #2546 does.

`split_comma_separated_declarations` accumulates source lines until the declaration looks
finished, and its `are_brackets_balanced` counts the `}` inside `/* } c */` as code, so
`const wrap = …` swallows the following `let w, h;`. `split_top_level_commas`, run on that
same accumulated string a few lines later, **is** comment-aware and splits at the `,`, and
every part is re-prefixed with the first line's keyword. The defect is the inconsistency
between two scans over one string, and it is the #2253 signature that #2283 consolidated five
other scans out of.

The seed also carried the same id as a `code-mismatch` before this; one comparison yields one
verdict, so those two entries are superseded, not additional.

### The delimiter is one mechanism, no longer the dominant one

Each comment kind is chosen with equal probability, so the per-kind mutant counts are uniform
(1,460–1,556) and the rates are directly comparable. The gate prints this table itself, so it
cannot drift from the ratchet it describes:

| comment kind | findings | mutants | per 1,000 |
|---|---|---|---|
| `line-with-semi` (`// ; c`) | 87 | 1,520 | 57.2 |
| `line-with-brace` (`// } c`) | 86 | 1,554 | 55.3 |
| `block-with-paren` (`/* ) c */`) | 75 | 1,470 | 51.0 |
| `block` (`/* c */`) | 61 | 1,511 | 40.4 |
| `line-with-paren` (`// ) c`) | 60 | 1,556 | 38.6 |
| `block-with-brace` (`/* } c */`) | 58 | 1,532 | 37.9 |
| `svelte-ignore` | 52 | 1,460 | 35.6 |
| `line` (`// c`) | 46 | 1,513 | 30.4 |

**Delimiter-carrying kinds: 46.0 per 1,000. Plain comments: 35.4. Ratio 1.30×.**

Under oxfmt 0.61 this ratio was **2.81×** and the section claimed the mechanism *was* the
delimiter. It no longer supports that: the plain-comment rate rose from 8.0 to 35.4 per 1,000
while the delimiter rate only doubled, so most of what 0.61 was absorbing is insensitive to the
comment's content. The delimiter signal is real and still there — it is simply not the majority
of this bucket.

The delimiter share is the #2253 signature: a text-level rewrite locates a terminator by
scanning bytes instead of lexing, so a `}` / `)` / `;` inside a comment is read as code. #2283
consolidated five such scans behind `shared/js_scan.rs::skip_opaque`.

The content-insensitive majority is a different mechanism. Sampling the first difference in the
string each verdict is computed from, **353 of 525 (91%)** are a parenthesis: official emits
`() => (items())` where rsvelte emits `() => items()`. On the unmutated seed the two agree, so
inserting a comment is what changes rsvelte's paren emission.

### By source repository

`svelte` 151, `layerchart` 75, `flowbite-svelte` 69, `svelte.dev` 44, `skeleton` 43,
`bits-ui` 24, `svelte-heroicons` 24, `shadcn-svelte` 14, `svelte-ux` 14, then a tail of ≤10
each. The concentration tracks how much class-field and rest-props code each project ships,
not anything about the projects themselves.

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
  anything is inserted, so a divergent mutant of one is not attributable to the mutation. 2 of
  14,131 entries are currently excluded on that basis.
