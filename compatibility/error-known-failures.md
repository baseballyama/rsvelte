# Error-parity known failures

Companion to `known-failures.md` and `warning-known-failures.md`, for the
**compile error** half of the corpus gate.

`scripts/compat-corpus/compile.mjs` records every compile failure as
`(code, message, line, column)` in `error.json` beside the output; `verify.mjs`
compares them and ratchets two failure modes independently. Both ratchets are
shrink-only and two-sided: an unlisted entry that diverges fails CI, and a
listed entry that has started passing fails CI too.

Regenerate after a change that moves compile errors:

```
node scripts/compat-corpus/verify.mjs --no-fmt --update-error-baseline
```

`--update-error-baseline` touches **only** these six files, never the output or
warning ratchets — error comparison needs no oxfmt normalization, so it is valid
under `--no-fmt`, which the output comparison is not.

## Why this gate exists

The output verdict has always known whether both compilers *rejected* an entry
and whether the error `code` agreed. It knew nothing else: `errorInfo` recorded
the first message line but `verify.mjs` never read it back, and no `start`/`end`
was captured on either side (#2446). So an error with the right code at the
wrong position, or with prose naming the wrong construct, scored `error-parity`
— a passing verdict.

The size of that blind spot is measured, not assumed. Over the 14,131-entry
corpus, 948 entries are rejected by both compilers, giving 2,843 `(id, target)`
pairs with two errors to compare. On the field the gate already had:

| compared field | diverging pairs |
|---|---|
| `code` (pre-existing) | **0** |
| `message` (new) | 362 |
| `(line, column)` (new) | 1,209 |

The `code` column is the point. It is saturated — not one pair in 2,843
disagrees — so growing the corpus could never have moved this gate, while the
two new columns were failing on 121 and 403 distinct entries the whole time.

Nor do the fixture suites cover it. 33 of the 121 message divergences and 120 of
the 403 position divergences are
`svelte/packages/svelte/tests/compiler-errors/samples/…` — entries the
145/145-passing Compiler Errors suite compiles. That suite *parses* the sample's
expected `message` and `position`, then asserts only `error_code_matches`
(`crates/rsvelte_core/tests/compiler_errors.rs:272`); the parsed `message` field
is `#[allow(dead_code)]`. So those 153 divergences were being compiled by a green
test and compared on the one field that agrees.

## Why the two ratchets are split

Same argument as `warning-known-failures.md`. Wrong prose is a semantic bug
fixed one message string at a time; a wrong span is one systemic cause (raising
sites that never thread the triggering node through). Folded together, the
larger span backlog would hide every semantic regression behind it.

The two are also compared **independently** of each other — unlike warning
positions, which are only compared once the codes agree. There is exactly one
error per entry and target, so there is no pairing problem that would require
chaining, and chaining would mean a PR that fixes a message surfaces a
"new" position failure that was merely masked.

Both comparisons are skipped when the two codes differ: the message and span of
two unrelated errors say nothing, and the code divergence is an `error-mismatch`
on the output ratchet already.

## Why the per-target files are near-identical

`error-message-known-failures.client.json` holds 121 entries,
`error-message-known-failures.client-dev.json` holds 121 entries and
`error-message-known-failures.server.json` holds 120 entries; all three of
`error-position-known-failures.<target>.json` hold 403 entries. Almost every
compile error is raised in Phase 1/2, before the target is consulted, so a
divergence shows up on all three targets at once. Expect the six files to move
together in a burn-down PR.

The single asymmetry is genuinely target-dependent, which is exactly what the
split exists to keep visible:
`svelte/packages/svelte/tests/migrate/samples/svelte-component/input.svelte`
fails client codegen on both compilers (`Not implemented: LetDirective`) and
compiles clean for `server`, so there is no server-side pair to compare.

## Error messages

The codes agree; the prose does not. This is not tolerated as "upstream rewords
things on a minor bump": both compilers run on the same source, in the same
process, at the pinned version, so a difference here is rsvelte's — the argument
settled for warning text in #2403.

Clustered by code (client target, 121 entries):

- **`dollar_binding_invalid` — 76, the whole majority.** rsvelte says
  ``Cannot use `$` as a variable name``; upstream says `The $ name is reserved,
  and cannot be used for variables and imports`. rsvelte's text names only the
  variable case, and 73 of the 76 entries reach it from an *import*
  (`import * as $ from 'svelte/internal/client'`, in svelte's own `_expected`
  snapshots), so the user is told about a rule that does not appear to apply.
  One string.
- **`js_parse_error` — 15.** The Svelte code is right, but the text is oxc's
  parser message (`Expected `,` or `}` but found `+`) where upstream forwards
  acorn's (`Unexpected token`). This is the one cluster whose fix is not a string
  edit: the two parsers phrase their own diagnostics, and rsvelte's text is often
  the *more* informative of the two. Listed as a divergence rather than silently
  normalised, so the decision to keep or converge stays explicit.
- **`rune_invalid_arguments_length` — 10.** Argument-count wording.
- **`each_item_invalid_assignment` — 3**, **`props_invalid_placement` — 3**
  (`can only be used as a variable declaration initializer at the top level of
  the `<script>` tag` vs upstream's `can only be used at the top level of
  components as a variable declaration initializer`).
- **12 singletons and pairs** — `attribute_invalid_sequence_expression` (2,
  "Sequence expressions" vs "Comma-separated expressions"),
  `rune_missing_parentheses` (2), `import_svelte_internal_forbidden` (2),
  `rune_renamed`, `invalid_arguments_usage`, `expected_token`, `props_duplicate`,
  `rune_invalid_arguments`, `dollar_prefix_invalid`,
  `element_invalid_closing_tag_autoclosed` (1 each). Each is one message string.
- **1 entry with no code on either side** —
  `svelte/packages/svelte/tests/migrate/samples/svelte-component/input.svelte`.
  Both compilers raise an uncoded internal failure (`Not implemented:
  LetDirective`); rsvelte prefixes it with `Code generation error: `. This is the
  measured answer to the reachability question #2446 left open: a `null` code
  occurs on **1** of 2,843 pairs, and on **0** pairs one-sidedly, so the output
  verdict's `e.code && a.code &&` guard has never actually degraded a real
  divergence to `error-parity` in this corpus.

## Error positions

The codes agree; `start` does not. An editor, a Vite overlay and `rsvelte-check`
all place the diagnostic from `start`, so a wrong one points the user at the
wrong code.

By shape (client target, 403 entries):

- **349 — rsvelte reports no span at all.** The raising site constructs
  `AnalysisError::validation(...)` instead of `validation_at(...)`, so
  `start`/`end` are `None` and the JS error carries no `start` property. This is
  the same structural gap `validator-known-failures.md` estimates at ~141
  fixtures; the corpus now measures it at 349 real-world entries, and the two
  burn down together — one `validation_at` call per raising site.
- **35 — same line, different column.** A span exists but is narrowed or widened
  wrongly (e.g. `expected_token`, `attribute_empty_shorthand`).
- **19 — different line entirely.** The worse symptom of the same defect: a
  plausible but wrong location. `date-picker-svelte/src/lib/DateInput.svelte`
  reports 296:0 where upstream reports 262:11 — 34 lines off, and column 0 means
  the squiggle lands on the indentation of an unrelated statement.

Clustered by code, the largest are `dollar_binding_invalid` (76),
`expected_token` (19), `js_parse_error` (17), `constant_assignment` (12),
`global_reference_invalid` (11), `rune_invalid_arguments_length` (10),
`bind_invalid_name` / `state_invalid_placement` / `constant_binding` (9 each) —
a long tail of ~100 codes, one raising site each, which is why this is a
per-site burn-down and not one edit.

## What these two ratchets still do not see

- **`end`.** Only `start` is compared. Upstream highlights a range; rsvelte's
  `end` is frequently `start + 1` even where `start` agrees
  (`attribute_duplicate` on `<div a="1" a="2">` reports `[11, 12]` against
  upstream's `[11, 16]`), so a wrong highlight *length* is invisible here. Not
  folded in, because it would swamp the position ratchet with a third failure
  mode that has its own cause.
- **`frame`.** The rendered code frame is neither captured nor compared.
- **Entries only one side rejects.** Those are `error-mismatch` on the output
  ratchet; there is no second error to compare against.
- **`compileWithCssHash`.** The async entry still reports failures as a
  `Debug`-formatted message with no `code`/`start`; the corpus does not use it.
