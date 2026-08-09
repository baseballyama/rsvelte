# Validator fixtures excluded from the warning-message comparison

Shrink-only ratchet for `compatibility/validator-message-not-comparable.json`, enforced by
`validator_warning_messages_match_official` in `crates/rsvelte_core/tests/validator.rs`.

It does not list *divergences* — those live in `validator-message-known-failures.json`. It
lists fixtures the message comparison **never reaches**, which is a third state, and the one
the gate used to be unable to name.

## Why a third state exists

The message comparison only runs where the two sides already agree on which warnings were
emitted; codes, counts and spans are `validator-known-failures.json`'s business. So a fixture
leaves the comparison whenever anything upstream of the text disagrees — and before this
ratchet existed, leaving was indistinguishable from passing:

- a listed entry that starts matching drops out of `diverged`, which is the intended signal;
- a listed entry whose **codes or counts regress** never reaches the text comparison, so it
  also drops out of `diverged`, and was reported with the identical wording.

Acting on the second as if it were the first deletes the entry and permanently hides the
regression that caused it. The test now reports the two separately: a listed entry that stops
diverging fails as `now match — remove them` only when it was **compared**, and as
`no longer reach the message comparison … this is a REGRESSION, not a fix` otherwise.

## The taxonomy, and which half needs an entry here

`NotComparable` (`validator.rs`) records exactly why each fixture dropped out. Three causes are
**structural** — properties of the fixture rather than of rsvelte — and need no entry:

| cause | meaning |
|---|---|
| `OptedOut` | upstream's `_config.js` sets `skip: true` or a `warningFilter` |
| `NoInput` | the sample carries no readable `input.svelte(.js)` |
| `BothRejected` | official rejects the input and so does rsvelte — there are no warnings on either side |

The remaining six are rsvelte divergences that *also* silently remove the fixture from this
gate, and each one must be listed here with a justification:

| cause | meaning |
|---|---|
| `NoOracle` | no generated `warnings.json` — the official run left no oracle |
| `Panicked` | rsvelte panicked while compiling |
| `RsvelteRejected` | rsvelte rejects an input official accepts |
| `RsvelteAccepted` | rsvelte accepts an input official rejects |
| `CountDiffers` | the two sides emit a different number of warnings |
| `CodesDiffer` | the two sides emit different codes, or in a different order |

The point of requiring a declaration is that the last four are already covered by
`test_validator`, whose ratchet is empty. Adding an entry to
`validator-known-failures.json` therefore has a **second** cost that was invisible: the fixture
stops being watched for message text too. This file is where that cost has to be written down.

## Current baseline: `validator-message-not-comparable.json`, 0 entries

Empty, and empty is the load-bearing state: with `validator-known-failures.json` also at 0,
every runnable fixture either reaches the message comparison or falls into one of the three
structural causes. A single non-structural drop-out fails the suite.

Raw counts are printed on every run (`fixture(s) compared`, `message(s) compared`, and a
per-cause histogram of the non-comparable set) because a rate cannot distinguish "no
divergences" from "no comparisons".

## Removing an entry

Fix the cause, then delete the id here and in the `.json`. The ratchet is two-sided: an entry
that becomes comparable again fails the suite just as an undeclared drop-out does.
