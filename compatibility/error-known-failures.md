# Error-parity known failures

Companion to `known-failures.md` and `warning-known-failures.md`, for the
**compile error** half of the corpus gate.

`scripts/compat-corpus/compile.mjs` records every compile failure as
`(code, message, start, end, frame)` in `error.json` beside the output;
`verify.mjs` compares them and ratchets four failure modes independently. Every
ratchet is shrink-only and two-sided: an unlisted entry that diverges fails CI,
and a listed entry that has started passing fails CI too.

Regenerate after a change that moves compile errors:

```
node scripts/compat-corpus/verify.mjs --no-fmt --update-error-baseline
```

`--update-error-baseline` touches **only** these sixteen files, never the output
or warning ratchets — error comparison needs no oxfmt normalization, so it is
valid under `--no-fmt`, which the output comparison is not.

Every one of these comparisons scores `match` when there is nothing to compare,
so the verdicts alone cannot tell "rsvelte agrees" from "no error survived to be
compared". `verify.mjs` therefore prints the size of the compared population
beside the counts, records it in `report.json` as `errorComparedPairs`, and
refuses `--update-error-baseline` when it is zero. See *What an absent artifact
scores* below.

## Why this gate exists

The output verdict has always known whether both compilers *rejected* an entry
and whether the error `code` agreed. It knew nothing else: `errorInfo` recorded
the first message line but `verify.mjs` never read it back, and no `start`/`end`
was captured on either side (#2446). So an error with the right code at the
wrong position, or with prose naming the wrong construct, scored `error-parity`
— a passing verdict.

The size of that blind spot is measured, not assumed. Over the 14,179-entry
corpus, 948 entries are rejected by both compilers, giving 2,843 `(id, target)`
pairs with two errors to compare. Per compared field, **as first measured** — the
current backlog is the entry counts under *Why the per-target files are
near-identical*, and the shape of the burn-down is recorded per section below:

| compared field | diverging pairs | diverging ids (client) |
|---|---|---|
| `code` (pre-existing) | **0** | 0 |
| `message` | 362 | 121 |
| `start` `(line, column)` | 678 | 226 |
| `end` `(line, column)` | 729 | 243 |
| `frame` | 15 → **0** | 5 → **0** |

The `code` row is the point. It is saturated — not one pair in 2,843 disagrees —
so growing the corpus could never have moved this gate, while every other row was
diverging the whole time. The `frame` row is stated as a transition because the
comparison that first ran it found a single renderer defect and this PR fixed it;
see *Error frames* below for why 0 there is "saturated" and not "unenrolled".

Nor do the fixture suites cover it. 33 of the 121 message divergences and 120 of
the 403 position divergences are
`svelte/packages/svelte/tests/compiler-errors/samples/…` — entries the
145/145-passing Compiler Errors suite compiles. That suite *parses* the sample's
expected `message` and `position`, then asserts only `error_code_matches`
(`crates/rsvelte_core/tests/compiler_errors.rs:272`); the parsed `message` field
is `#[allow(dead_code)]`. So those 153 divergences were being compiled by a green
test and compared on the one field that agrees.

## Why the four ratchets are split

Same argument as `warning-known-failures.md`. Wrong prose is a semantic bug
fixed one message string at a time; a wrong span is one systemic cause (raising
sites that never thread the triggering node through). Folded together, the
larger span backlog would hide every semantic regression behind it.

`end` is separate from `start` for a reason that is measured rather than argued
by analogy: **an entry listed for one suppresses everything about that entry**,
so folding `end` into the `start` ratchet would silently absorb the 51 pairs /
**17 ids that diverge on `end` while `start` agrees**. Those 17 are the entries
where the error points at the right place and underlines the wrong amount of
code — the only ones a user could not diagnose from the message. They are 7% of
the `end` population and 100% of what the fold would cost.

`frame` is the one comparison that is deliberately **chained**, and for the
opposite reason to the others: upstream derives it from `start.line` and
`end.column` alone (`compile_diagnostic.js:72`), so an unchained `frame`
comparison would be a third restatement of the two span comparisons rather than a
new question. Gated on both endpoints agreeing, it can only see the renderer —
the line window, the tab expansion and the caret column.

Message, `start` and `end` are compared **independently** of each other — unlike
warning positions, which are only compared once the codes agree. There is exactly
one error per entry and target, so there is no pairing problem that would require
chaining, and chaining would mean a PR that fixes a message surfaces a "new"
position failure that was merely masked.

All four comparisons are skipped when the two codes differ: the message and span
of two unrelated errors say nothing, and the code divergence is an
`error-mismatch` on the output ratchet already.

## Why the per-target files are near-identical

`error-message-known-failures.client.json` holds 0 entries;
`error-message-known-failures.client-dev.json` holds 0 entries;
`error-message-known-failures.server.json` holds 0 entries; and
`error-message-known-failures.server-dev.json` holds 0 entries. All four of
`error-position-known-failures.<target>.json` hold 35 entries, all four of
`error-end-known-failures.<target>.json` hold 48 entries, and all four of
`error-frame-known-failures.<target>.json` hold 0 entries. The wave-2 enrolment
(#3130) added 1 message, 16 position and 24 end entries — and **no frame entries
at all**, which keeps that comparison's population saturated at 0 across a corpus
that more than doubled. The counts above are the re-measurement against the tree
this branch was rebased onto (message 18/17 → 13/12, position 99 → 81, end
128 → 101); the current population is **34,601 entries and 5,138 both-reject
`(id, target)` pairs**, against the 14,179 / 2,843 the table above was first
measured on. Almost every
compile error is raised in Phase 1/2, before the target is consulted, so a
divergence shows up on all four targets at once. Expect the sixteen files to move
together in a burn-down PR.

The malformed-markup position pass then retired 6 position and 12 end entries
per target, and the block-header pattern pass retired another 6 position and 2
end entries. The scoped-store diagnostic pass retired another 10 position and 10
end entries by attaching the offending `$name` identifier range. The detailed
shape partitions below remain the measured snapshot
from before those passes; they are historical evidence about the backlog's shape,
not a decomposition of the current 36/49 files.

The former client-only asymmetry is gone from the current corpus population, so
all four files now carry no message entries.

## Error messages

The codes agree; the prose does not. This is not tolerated as "upstream rewords
things on a minor bump": both compilers run on the same source, in the same
process, at the pinned version, so a difference here is rsvelte's — the argument
settled for warning text in #2403.

Clustered by code (client target, 0 entries):

- **Former `js_parse_error` cluster — 2 entries retired.** The Svelte code is right, but the
  text is oxc's parser message (`Expected `,` or `}` but found `+`) where upstream
  forwards acorn's (`Unexpected token`). This is the one cluster whose fix is not a
  string edit: the two parsers phrase their own diagnostics, and rsvelte's text is
  often the *more* informative of the two. Listed as a divergence rather than
  silently normalised, so the decision to keep or converge stays explicit. Five
  entries retired from this cluster at once: four were the semicolon-free and
  end-of-input shapes #3200/#3206 aligned, and `illegal-expression` was #3220 —
  acorn's `Assigning to rvalue`, which OXC's own `invalid_assignment` diagnostic
  had been pre-empting. Two more retired in #3317/#3319: the `(…)` this port
  wraps a template expression in to hand it to OXC has diagnostics of its own
  (`()`, a trailing comma, an arrow parameter list) that acorn — parsing the body
  unwrapped — never sees, and the body is now re-probed unwrapped when one of
  them fires.
  The template-expression strict-mode escape then retired separately: OXC had
  already recovered the string-literal AST, but its generic lexer diagnostic
  pre-empted the existing acorn-compatible `Octal literal in strict mode`
  check. Recovered AST restrictions now win only when they occur no later than
  OXC's first reported position.
  The top-level `return` fragment from the attachments tutorial retired as the
  fixed-message case: both parsers reject it at the same byte, and the program
  diagnostic adapter now translates OXC's wording to acorn's
  `'return' outside of function`.
  The incomplete `{let }` declaration tag retired by handling acorn's bare
  reserved-word error before OXC's generic incomplete-declaration diagnostic.
  The object-pattern rest-comma fixture retired through the exact diagnostic
  adapter: OXC and acorn reject the same grammar error at the same parse site,
  but acorn reports `Comma is not permitted after the rest element`.
  The two reserved-word binding patterns retired together: the adapter uses
  OXC's keyword label for an array pattern and walks back from its missing-colon
  label to an object shorthand property, matching both acorn's contextual text
  and its point position.
  The malformed snippet-header entry retired separately: the parameter scanner
  now preserves upstream's required `)` diagnostic at the trimmed end of the
  component instead of falling through to the outer `}` check.
  The final two entries retired together by adapting OXC's expected-delimiter
  diagnostics to acorn's `Unexpected token`: one malformed object expression
  in a template and one TypeScript annotation in a plain-JavaScript snippet
  parameter list.

## Error positions

The codes agree; `start` does not. An editor, a Vite overlay and `rsvelte-check`
all place the diagnostic from `start`, so a wrong one points the user at the
wrong code.

By shape (client target, 92-entry measurement snapshot), classified from the run's own
`error.json` records rather than by subtracting from the previous baseline:

- **29 — rsvelte reports no span at all.** The raising site constructs
  `AnalysisError::validation(...)` instead of `validation_at(...)`, so
  `start`/`end` are `None` and the JS error carries no `start` property. This is
  the same structural gap `validator-known-failures.md` tracks, and the two burn
  down together — one `validation_at` call per raising site.
- **35 — same line, different column.** A span exists but is narrowed or widened
  wrongly (e.g. `expected_token`, `attribute_empty_shorthand`).
- **28 — different line entirely.** The worse symptom of the same defect: a
  plausible but wrong location. `date-picker-svelte/src/lib/DateInput.svelte`
  reports 296:0 where upstream reports 262:11 — 34 lines off, and column 0 means
  the squiggle lands on the indentation of an unrelated statement.

The shrink from 226 is **entirely inside the no-span cluster** — 174 → 29 — and
the different-line cluster has not grown. That is the shape a
span-attachment change should have, and it is worth stating because the failure
mode it rules out is the one `validator-known-failures.md` names: a fallback that
lands a *plausible wrong* span in place of none would have moved entries from
no-span into different-line, shrinking the count while making the diagnostics
worse. It did not.

Clustered by code, the largest are `expected_token` (19: 12 different-line, 7
same-line), `css_expected_identifier` (16, all different-line), `js_parse_error`
(16, all same-line), `store_invalid_scoped_subscription` (10, all no-span),
`block_invalid_continuation_placement` (6, all same-line), then
`snippet_invalid_export` (5, all no-span) and `attribute_empty_shorthand` (3) —
a tail of 21 codes in total, one raising site each, which is why this is a
per-site burn-down and not one edit.

## Error end positions

The codes agree; `end` does not, so the diagnostic underlines the wrong amount of
code. The canonical shape is `<div a="1" a="2">`, where `attribute_duplicate`
reports `position: [11, 12]` against upstream's `[11, 16]` — the right start, one
character of highlight instead of the whole attribute.

Partition of the measured error-end snapshot by shape (client target,
classified from the run's own `error.json` records):

- **29 — rsvelte reports no `end` at all.** The same `validation(...)` vs
  `validation_at(...)` raising sites the `start` ratchet's no-span cluster names;
  these two clusters burn down together, one call per site. It is the same 29
  entries, which is what "one call per site" predicts.
- **50 — same line, different column.** A span exists and stops in the wrong
  place. This is the cluster the `start` ratchet cannot reach, and it is still the
  largest: attaching a span fixes `start` and leaves `end` free to be wrong.
- **33 — different line entirely.** A multi-line construct whose closing node was
  not threaded through.

Neither the wave-2 enrolment nor the rebase re-measurement moved the *shape* of
this backlog — all three clusters move together, which is the answer to "did new
repositories find a new shape of span defect, or more instances of the three we
had?" — more instances.

**20 of the 112 diverge on `end` while `start` agrees** (15 same-line, 5
different-line). Those are the ones that would have been invisible had `end` been
folded into the `start` ratchet, and they are the argument for the split: an
entry already listed suppresses everything about that entry.

## Error frames

Both endpoints agree, and the rendered code frame does not — which under the
chaining above can only be the renderer.

`error-frame-known-failures.<target>.json` holds **0 entries, and that 0 is
saturated, not unenrolled.** The comparison inspects **2,114 of the 2,843
both-reject pairs** (the ones whose `start` and `end` both agree), 2,112 of which
carry a frame on both sides and 2 of which carry one on neither; no pair has a
frame on exactly one side. Its first run reported **15 pairs / 5 ids** diverging,
all one cause: `tabs_to_spaces_column` computed the caret column as
`leading_tabs + column` with no upper bound, while upstream measures
`tabs_to_spaces(line.slice(0, column)).length`, which saturates at the line's own
length. The caret column comes from `end`, which for a multi-line construct sits
past the end of the `start` line the frame quotes, so every affected frame put the
caret one column too far right. Fixed in the same PR that added the comparison,
which is why the enrolled baseline is 0 — the 15 pairs are the evidence that the
comparison can move, and `frame_caret_stops_at_the_end_of_the_quoted_line`
(`crates/rsvelte_core/src/compiler/mod.rs`) is the unit-level control.

## What an absent artifact scores

Every comparison here reads `expected/<id>/error.json` and `actual/<id>/error.json`
and skips the pair when either is missing, so a **missing artifact scores
`match`** — a run against a half-swept tree reports 100% error parity rather than
failing, and `--update-error-baseline` would then write twelve empty ratchets.
Measured on a real half-swept tree: with `expected/` gone and `actual/` intact,
the comparison scored **0 pairs compared, 14,179/14,179 entries `match`**.

Three things now stand between that state and a verdict. `verify.mjs` requires,
**per tree** rather than on the union of the two, that every manifest entry carry
either `<target>.js` or that target's key in `error.json` for **every** selected
target — the exact invariant `compile.mjs`'s `writeOutputs` establishes. It prints
the compared-pair count beside the verdicts and stores it in `report.json`. And
`--update-error-baseline` refuses outright when that count is zero.

## What these four ratchets still do not see

- **Entries only one side rejects.** Those are `error-mismatch` on the output
  ratchet; there is no second error to compare against.
- **The `character` offset and `filename`.** Only `(line, column)` is compared
  for each endpoint, and `filename` is not captured at all.
- **`frame` where the endpoints already diverge.** 729 of the 2,843 pairs are
  outside the frame comparison's population by construction; their frames are
  wrong *because* their spans are, and they are counted once, under `start` or
  `end`.
- **Every NAPI entry except `compile` / `compileBoth` / `compileModule` /
  `compileWithCssHash`.** The corpus drives the first three and this PR converted
  the fourth, but `compileEnvelope*` — which is what `@rsvelte/vite-plugin-svelte`
  actually calls for `compile()` and for `compileAsync()` without a `cssHash` —
  still surfaces a failure as a Rust `Debug` string with no `code`/`start`/`end`.
  The corpus cannot see that: it calls the legacy entries.
