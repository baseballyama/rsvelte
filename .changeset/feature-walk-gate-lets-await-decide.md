---
"@rsvelte/compiler": patch
---

Skip the await / rune-reference walk when neither half of its gate can fire

The gate on the analyze-phase feature walk was `has '$' || has "await"`. Every
rune name starts with `$`, so the first probe passes on most components and the
second — true for about 1% of them — never gets a say. But `$` is only
*informative* while rune detection is on: once runes mode is already decided,
the walk's sole surviving output is `has_await`, which an `await`-free source
settles without walking anything.

The gate now reads `(needs_rune_detection && has '$') || has "await"`, which is
observationally equivalent: the `has_rune_reference` half of the result is read
only under `needs_rune_detection`.
