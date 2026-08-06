# Corpus-seeded mutation fuzz — known failures

Ratchet for `scripts/compat-corpus/mutate-corpus.mjs` (#2281 Gate 3). Shrink-only; two-sided
under `--full` (a sampled run cannot prove an entry is stale, so it checks regressions only).
Re-baseline with `pnpm run corpus:mutate:update`.

## Why this gate exists

The collected corpus is at **0 known failures on all three targets** — it is saturated. That
does not mean the compiler is correct; it means this input distribution has nothing left to
teach. So the 14,027 entries stop being the test set and become a **seed set**: insert one
semantics-preserving comment at a line boundary inside a `<script>` region and require parity
on the mutant.

Two live bugs came out of the first sweep, neither reachable from the unmutated corpus:

- **#2351** — a comment containing `}`, `)` or `;` inside a `$:` block body **aborts the client
  compiler with SIGSEGV**. Not an exception: the host process dies.
- **#2347** — a `//` comment before the closing brace of a `$props()` pattern swallows the
  `$.rest_props(...)` initializer. The output parses, so nothing catches it; at runtime every
  forwarded attribute silently disappears.

## What is gated, and what is only counted

A divergent mutant is classified by whether the difference survives normalizing comments,
whitespace and trailing commas away:

| verdict | in this ratchet | meaning |
|---|---|---|
| `code-mismatch` | yes | the generated **code** changed because a comment moved |
| `compiler-crash` | yes | rsvelte aborted the process on the mutant |
| `error-mismatch` | yes | exactly one compiler rejected the mutant |
| `comment-mismatch` | **no** | the comment was dropped, duplicated or relocated, or a line broke differently |

The split is the difference between a gate and a backlog dump. The full sweep produces
**13,242** comment-only divergences against **213** code ones — ratcheting per id without the
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
parse (70 parse diagnostics per full sweep). It was measured to reclassify **0 of 213**
entries, so it is in for honest reporting rather than to change a verdict: the first difference
the gate prints must be the reason for the verdict, and before this a reviewer could see
`import 'x'` vs `import "x"` and dismiss a real finding sitting further down the same file.

## Mutation known failures (`mutation-known-failures.json`, 214 entries)

Full sweep: 14,027 seeds → 12,515 mutants → 37,545 comparisons.

| verdict | entries |
|---|---|
| `code-mismatch` | 213 |
| `compiler-crash` | 1 |
| `error-mismatch` | 0 |

By target: `client-dev` 90, `client` 72, `server` 51.

### The mechanism is the delimiter, not the comment

Each comment kind is chosen with equal probability, so the per-kind mutant counts are uniform
(1,463–1,544) and the rates are directly comparable:

| comment kind | findings | mutants | per 1,000 |
|---|---|---|---|
| `line-with-semi` (`// ; c`) | 46 | 1,519 | 30.3 |
| `line-with-brace` (`// } c`) | 44 | 1,544 | 28.5 |
| `block-with-brace` (`/* } c */`) | 28 | 1,516 | 18.5 |
| `block-with-paren` (`/* ) c */`) | 26 | 1,463 | 17.8 |
| `line-with-paren` (`// ) c`) | 26 | 1,544 | 16.8 |
| `svelte-ignore` | 19 | 1,457 | 13.0 |
| `line` (`// c`) | 17 | 1,509 | 11.3 |
| `block` (`/* c */`) | 7 | 1,502 | 4.7 |

**Delimiter-carrying kinds: 22.4 per 1,000. Plain comments: 8.0. Ratio 2.81×.**

That is the #2253 signature: a text-level rewrite locates a terminator by scanning bytes
instead of lexing, so a `}` / `)` / `;` inside a comment is read as code. #2283 consolidated
five such scans behind `shared/js_scan.rs::skip_opaque`; this ratchet is the measure of how
many call sites were not covered.

Plain comments are not at zero (8.0 per 1,000), so delimiter mis-lexing does not explain
everything — some sites mishandle a comment in that position regardless of its content.

### By source repository

`shadcn-svelte` 60, `layerchart` 31, `svelte` 25, `svelte-heroicons` 24, `bits-ui` 17,
`svelte-ux` 10, `pattern` 8, `flowbite-svelte` 6, then a tail of ≤6 each. The concentration
tracks how much class-field and rest-props code each project ships, not anything about the
projects themselves.

### `compiler-crash` — 1 entry

`svelte/packages/svelte/tests/migrate/samples/reactive-statements-reorder-not-deleting-additions/input.svelte`
— tracked as **#2351**. Because a panic aborts the process, the sweep compiles in child
processes (mirroring `compile.mjs`): the worker prints `IDX <i>` before each seed, so the
parent names the crashing seed, records it, and resumes at the next one. A single-process
sweep loses the entire run to one bad mutant — which is exactly what happened on the first
attempt.

## Stability of the ratchet

Ids are `<corpus id with __L<line>__<kind> before the extension> [verdict] (target)`.

- The mutant a seed contributes is chosen from **that seed's own hash**, not from its index in
  the manifest, so adding or removing a corpus entry does not reshuffle every other entry's
  mutants.
- The tag goes **before** the extension so the compiler still receives a filename ending in
  `.svelte` / `.svelte.js` / `.svelte.ts`. Appending it instead produced 9 spurious
  `error-mismatch` entries that vanished when the filename was made valid — dev mode bakes the
  filename into its output, and an unrecognised extension selects paths the real pipeline never
  takes.
- Seeds already listed in `known-failures.<target>.json` are excluded: they diverge before
  anything is inserted, so a divergent mutant of one is not attributable to the mutation. All
  three ratchets are currently empty, so every entry is eligible.
