# lint-adversarial-end-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-end.mjs` compares, for every finding
whose full `(ruleId, line, column, message)` key **already matches** on both
sides, the `(endLine, endColumn)` pair. Every other lint gate keys a finding on
its START, so a rule that reports at the right place with the right text and
underlines the wrong region was invisible to all of them — the same split the
compiler-error gates already make, where `end` is ratcheted apart from `start`
because an entry listed for one suppresses everything about that entry.

Entry format: `<pattern>|<ruleId> <start>\t<oracle end>\t<rsvelte end>`.

The first run reported **670 divergences over 4611 compared findings across 20
rules**. All but the accepted shape below were fixed, and in every case the cause
was one wrong `ctx.report` argument rather than many separate bugs — four rules
were passing `end == start`, i.e. a zero-width range, which alone accounted for
73 rows.

**The expectation is that every entry in this file is of one shape**, described
next. `lint-adversarial-end-known-failures.json` currently holds 12 entries over
5519 compared findings; it was at 7
before ~290 patterns were added, and the growth is the coupling this file's last
section describes rather than a regression — 5 of the new patterns reach
`experimental-require-slot-types`, whose report has no upstream end at all.
Judge this ratchet by whether every entry is the accepted shape, not by its
count.

## The one accepted shape: upstream has no end at all

ESLint omits `endLine` / `endColumn` entirely when a rule reports a bare
position (`loc: { line, column }`) instead of a node. Two rules do that:

- `experimental-require-slot-types` — `context.report({ loc: { line: 1, column: 1 }, messageId })`
  (`experimental-require-slot-types.ts:53-58`). 10 entries.
- `block-lang`, the `enforceStylePresent` arm — `context.report({ loc: { line: 1, column: 1 }, message, suggest })`
  (`block-lang.ts:105-112`). 2 entries. Its per-node arms pass `node: styleNode` /
  `scriptNode` and already match.

`block-lang`'s `enforceScriptPresent` arm reports the same way and would add a
third source, but it is **unreachable by this corpus**: options are supplied to
a pattern through an inline `/* eslint <rule>: [...] */` comment, which ESLint
only reads from a JS comment, which requires a `<script>` — whose absence is the
condition that arm tests. Neither an HTML comment nor a CSS comment is picked up
(measured). The arm was checked by hand instead, driving both sides with an
explicit config: both report at 1:2 with the same message.

`rsvelte_diagnostics::Range` has no way to express an absent end, and giving it
one would change a type `svelte-check` and the language server share, where a
diagnostic without an end is meaningless. The gate compares these as the literal
string `null` rather than skipping them, so an accidental change to the end
rsvelte invents is still caught.

## Reading this gate next to gate 28

The two are coupled in one direction. A finding one side does not report has no
counterpart, so it is skipped here rather than reported — which keeps this
ratchet from becoming a copy of the report ratchet, and means **fixing a
start-side divergence ADDS rows here** as newly-matched findings become
comparable. A growing count after a report-gate fix is expected. A *shrinking*
count is the one to look at: it can mean a finding stopped being reported at
all, which is a report-gate regression wearing this gate's clothes.
