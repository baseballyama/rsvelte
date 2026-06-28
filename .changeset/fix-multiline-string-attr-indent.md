---
"@rsvelte/fmt": patch
---

fix(fmt): don't double-count indent for interpolations in multi-line string attributes

A multi-line quoted attribute value (`style="…\n\tleft: {expr}%;\n…"`) carries
each interpolation's physical column in the literal text already emitted on its
own line. The interpolation-width math was *also* subtracting the attribute's
logical indent, double-counting it — so an expression that actually fits was
force-broken (and a long member chain wrapped instead of the top-level operator).
The width now uses the physical column only for multi-line string values, so
`left: {$xGet(d) + ($xScale.bandwidth ? … : 0)}%;` and similar stay on one line,
matching the oxfmt / prettier-plugin-svelte oracle.
