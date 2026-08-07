# Validator warning message known failures

Shrink-only ratchet for `compatibility/validator-message-known-failures.json`, enforced by
`validator_warning_messages_match_official` in `crates/rsvelte_core/tests/validator.rs`.

It compares the **rendered text** of every warning whose code and ordinal already agree with
official, and is deliberately independent of `validator-known-failures.json`.

## Why a separate ratchet

`validator-known-failures.json` is per-fixture and all-or-nothing. Once a fixture is listed —
almost always because a span is missing — it stops being watched for its **message text** too.
All three entries below were suppressed that way, and `attribute_quoted` shipped a message
asserting the warning applies to plain elements, which it never does (#2391).

The generalisation is the point: **an entry suppresses everything about itself, not the thing
its justification names.** A justification should therefore say what the entry *stops
covering*, not only why it fails.

Nothing else covers this. `DIAGNOSTICS_DIGEST` in `2_analyze/diagnostics_test.rs` pins every
diagnostic's code and message, but it calls each constructor with **fixed placeholder
arguments** and its failure text asks a human to confirm the new wording — so the oracle is a
person and the unit is the template. It detects *change*, not *incorrectness*, and an
interpolation bug is invisible to it because the interpolated value is a placeholder.

## The oracle: "official run on this input", never "the official expectation"

The comparison uses the **generated** fixture — `fixtures/*/validator/<name>/warnings.json`,
produced by running the official compiler on the identical input — and **not** the sample's
checked-in `submodules/svelte/.../warnings.json`.

Upstream committed those files under a different `filename` than this harness passes. Any
message that interpolates the filename therefore disagrees with them spuriously: measured
against the checked-in file, `svelte-self-deprecated` looks like `Self`/`./Self.svelte` vs
`Input`/`./Input.svelte` — a bug that does not exist — instead of the real path-capitalisation
bug below. Diagnosing a real defect as a different defect is worse than a false positive,
because the wrong fix earns a green tick.

This bites message comparison specifically: codes and positions do not depend on the input's
*name*, which is why no earlier gate hit it. The corpus warning gate is immune by
construction — it runs both compilers on the same source in the same process. **A fixture-side
gate has to reproduce that property deliberately**, which is the whole reason this test reads
the generated tree rather than the sample directory.

## Current baseline: `validator-message-known-failures.json`, 2 entries

## Entries

### `svelte-self-deprecated` — `svelte_self_deprecated`

- rsvelte: ``<svelte:self>` is deprecated — use self-imports (e.g. `import Input from './Input.svelte'`) instead`
- official: ``<svelte:self>` is deprecated — use self-imports (e.g. `import Input from './input.svelte'`) instead`

The identifier is right; the **path** is capitalised and does not exist. Following the
suggestion breaks the build on a case-sensitive filesystem. Tracked in #2411.

### `a11y-anchor-in-svg-is-valid` — `a11y_invalid_attribute`

- rsvelte: `'' is not a valid href attribute`
- official: `'' is not a valid xlink:href attribute`

Inside SVG the attribute is spelled `xlink:href`; naming it `href` sends the reader to fix an
attribute that is not there. Tracked in #2413.

## Removing an entry

Fix the message, then delete the id here and in the `.json`. The ratchet is two-sided: a listed
entry that starts matching fails the suite just as a new divergence does, so the fix and the
re-baseline land in the same PR.
