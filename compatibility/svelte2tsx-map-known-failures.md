# svelte2tsx-map-known-failures.json — why entries are accepted

The svelte2tsx **source-map** gate (`scripts/compat-corpus/svelte2tsx-verify.mjs`,
invariants in `scripts/compat-corpus/sourcemap.mjs`) checks the `mappings` string
rsvelte's svelte2tsx port returns for every component corpus entry. The ratchet
may only shrink.

**Current baseline: `svelte2tsx-map-known-failures.json`, 0 entries.**

The two `map-missing` entries enrolled by wave 2 (#3130), `chatgpt-web`'s
`Home.svelte` and immich's `VideoNativeViewer.svelte`, now pass after the parser
fix and were removed together with their stale TSX baseline entries.
`map-invalid` remains **0** — no map rsvelte emits violates an invariant.

## Why this gate is structural rather than a diff against official

The other svelte2tsx ratchet compares TSX text to official `svelte2tsx`
byte-for-byte. The map cannot be compared that way. Both tools emit hires maps,
but magic-string segments its output differently — it adds chunk-boundary
segments, omits trailing empty generated lines, and splits runs at edit
boundaries rsvelte does not. The two maps therefore disagree entry-for-entry,
and not only cosmetically: they also answer `originalPositionFor` differently at
some generated positions.

Measured parity, where **13,464** is every corpus component for which *both*
tools return a map:

| Rule | Entries identical |
|---|---|
| `mappings` byte-identical | 0 of 13,464 |
| decoded segment sets identical | 0 of 13,464 |
| `originalPositionFor` identical at every generated position | 0 of a 245-component sample |
| per-generated-line set of referenced original lines identical | 4 of the same 245 |

A parity ratchet would therefore start at ~100% of the corpus and gate nothing.

**So this gate does not assert that the two maps agree.** It asserts that
rsvelte's map is structurally well-formed against the text it describes, using
the official map only as a **calibration oracle**: an invariant magic-string
itself violates is by definition too strict and does not belong in the set.
Official is clean on every entry. An entry where official *does* violate an
invariant is classified `map-oracle-invalid` and skipped, so an upstream change
can never be reported as an rsvelte failure.

## The invariants

- `undecodable` — `mappings` is not valid VLQ, or a segment has an unexpected
  field count (svelte2tsx never emits `names`).
- `extra-mapping-lines` — more mapping lines than the generated file has.
- `columns-not-sorted` — generated columns must be non-decreasing within a line.
- `copy-run-stalled` — **three or more** consecutive segments at one generated
  column whose original columns advance by `+1` each step on the same original
  line. This is the invariant that catches issue #2066, where every
  generated-column delta was zero so whole copied runs collapsed onto column 0.
  Both bounds are load-bearing and were measured, not guessed:
  - Only `+1` steps count. A *larger* original jump at an unchanged generated
    column is legitimate — deleted text (e.g. a hoisted `import`) collapses onto
    the surviving position — and occurs in ~48% of real corpus entries.
  - Runs of two are legitimate: the closing boundary of one chunk and the opening
    boundary of the next meet at one generated column when a single character
    between them is deleted (`$: (` → `let `). Flagging pairs produced 7
    false positives across the corpus; requiring three produces **0**.

  This rule fires on none of the **13,465** components for which rsvelte returns
  a map — the 13,464 above plus the one entry where official crashes internally
  and rsvelte does not. Reverting the #2066 fix in `magic_string.rs` and
  recompiling the 81 `pattern/` components flags 67 of them; simulating the same
  bug corpus-wide — zeroing every generated-column
  delta — flags 12,563 of the **13,352** components whose map has at least one
  generated line carrying two or more segments (the rest are too small for the
  bug to be observable). The gate therefore fails loudly, not marginally, if the
  bug returns.
- `generated-out-of-bounds` / `original-line-out-of-bounds` /
  `original-column-out-of-bounds` — every position must lie inside the text it
  refers to, in UTF-16 code units.

## What would justify an entry

Only a case where rsvelte's map is **correct and the invariant is wrong** — i.e.
official svelte2tsx produces a structurally analogous map for the same input and
is merely not caught by the same rule. Such a case means the invariant needs
narrowing (as `copy-run-stalled` was narrowed to `+1` steps), not that the entry
should be tolerated. A genuinely malformed map is always a bug to fix in
`crates/rsvelte_projection/src/svelte2tsx/magic_string.rs`, never a baseline
entry.
