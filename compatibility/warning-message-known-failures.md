# warning-message-known-failures.\<target\>.json — why entries are accepted

`scripts/compat-corpus/verify.mjs` compares each corpus entry's compiler warnings
against the official compiler in three dimensions, as a cascade — each reached only
when the one above it already agrees:

| dimension | ratchet | what a failure means |
|---|---|---|
| code | `warning-known-failures.<target>.json` | rsvelte warns where upstream does not, or is silent where it warns |
| position | `warning-position-known-failures.<target>.json` | codes agree, `(line, column)` does not |
| **message** | **`warning-message-known-failures.<target>.json`** | **code and position both agree, the prose differs** |

The three are separate because they have different causes and different fixes. Folded
together, the much larger position backlog would hide every semantic regression.

> **Not to be confused with `validator-message-known-failures.json`.** That is a
> different gate over a different population: the 332 `packages/svelte/tests/validator`
> fixtures, checked by `crates/rsvelte_core/tests/validator.rs`. This file gates the
> ~14k-entry real-world corpus. The names are one word apart and the two are unrelated
> — an entry in one says nothing about the other, and their counts are not comparable
> because the populations have different warning mixes.

## Why the message dimension needs its own gate

Until this file existed, the corpus never recorded `message` at all —
`compile.mjs`'s `normalizeWarnings` projected each warning to `(code, line, column)`
and the text was gone before anything reached disk. So the message was not "compared
loosely": it was **absent from both sides of every comparison**, at any corpus size.

That is invisible by construction rather than by sampling, which is the same shape as
the missing warning oracle behind #2281. Widening the comparison in `verify.mjs`
alone would not have fixed it — it would have compared a field neither side carried
and scored every entry as a match.

The dimension is not redundant with the other two. Measured on the real compilers,
`<svg><text><a xlink:href=''>x</a></text></svg>`:

```
codes    MATCH
position MATCH
message  DIFFER
  official: a11y_invalid_attribute: '' is not a valid xlink:href attribute
  rsvelte:  a11y_invalid_attribute: '' is not a valid href attribute
```

Both existing ratchets score that entry green. The message names an attribute that is
not on the element. Negative control, `<a href="">x</a>`: all three MATCH.

## What this gate cannot see

Stated so the next person does not have to rediscover it:

- **Entries that emit no warnings at all** contribute nothing. The denominator is
  entries that emit at least one warning, not the corpus.
- **Entries either compiler rejects** are skipped (`verify.mjs`, the `expErr`/`actErr`
  guard) — error parity covers those separately.
- **Codes that never fire on this corpus** are unmonitored in every dimension. A
  message can be wrong for years in a rule no corpus entry triggers.
- **Entries already listed in the code or position ratchet for the same target** never
  reach the message comparison, because the cascade stops at the first divergence. An
  entry suppresses everything about itself, not only the dimension its justification
  names.
- **The docs link is stripped** (`https://svelte.dev/e/<code>`, matching
  `crates/rsvelte_core/tests/validator.rs:202`). Both compilers emit it identically, so
  stripping changes no verdict at the point in the cascade where messages are compared
  — codes already agree by then. It is stripped so a code-level defect cannot leak into
  this ratchet, and so the two gates share one definition of "message".

## Current baseline

The three files start empty. They are populated from the first full corpus run; a
non-empty start is a finding about the corpus, not a failure of the gate. Every entry
added must carry a justification in this file naming the divergence and, where known,
the issue tracking it.
