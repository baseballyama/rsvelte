---
"@rsvelte/compiler": patch
---

compiler: a block comment whose host TypeScript construct is erased keeps its own column

A multi-line block comment re-emitted out of an erased construct is re-indented
downstream by the distance between its opener's column and its continuation
lines'. The opener arrived at whatever indentation the erased construct left
behind — the script's, not the comment's — so a comment nested deeper than the
script kept the difference on every continuation line (#4515).

The opener now arrives at the column it had in the source, which makes the two
quantities the same one again. Measured on six cells against Svelte 5.57.0, both
targets: the three where the comment is nested deeper than the script (spaces,
tabs, and with a surviving statement beside the erased construct) go from
divergent to byte-equal, and the three that already agreed — an opener at the
script's own indentation, a surviving host, a script-leading comment — are
unchanged.
