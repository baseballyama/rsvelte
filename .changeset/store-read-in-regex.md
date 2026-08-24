---
'@rsvelte/compiler': patch
---

Leave a store name inside a regex literal alone

`const re = /\$s/` next to a real `$s` subscription came out as `/\$s()/`, which
changes what the user's regex matches. The output parses and runs, so no parse
gate can see it; only output equality can.

The client store-read rewrite is a character scan that already skipped strings
and comments. A regex body is the third opaque kind, and it needs its own
predicate rather than an extension of the string one: telling `/re/` from a
division requires the previous significant code byte, which the string scan does
not track. `(1 / 2) + $s` is the control — a predicate that called every `/` a
regex opener would swallow the real store read after it.

This is the phase-3 half of the pair opened by #3620, which fixed the phase-2
`$`-reference collector. The two are independent: in #3620's cases the store
does not exist at all, and here it does — the subscription itself is correct.

Grid — 4 hosts × 12 opaque carriers × {store, prop} × 3 targets: **42 of 288
cells diverging → 32, with 0 new**. The ten that close are exactly the
regex-carrying store reads in a `$:` statement on the client and dev-client —
the population this scan owns. The 32 that remain are three unrelated causes the
grid separates by their control rows moving with them: an SSR fold that inlines
a regex-literal `const` (the `prop` row diverges identically, so it is not
name-dependent), a memoisation difference on an IIFE in a template expression,
and comment placement.
