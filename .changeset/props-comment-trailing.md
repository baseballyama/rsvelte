---
"@rsvelte/compiler": patch
---

client: a `$props()` declaration's inline comment stays on the declaration it lowered to

Upstream prints a comment that sits inline before the `$props(` call after the `;`
of the declaration the lowering produced. rsvelte printed it as a statement of its
own ahead of the script for the whole-object form (`let p = $props()`, where the
transform drops the comment) and on a line of its own after the statement for the
rest form (`let { a, ...z } = $props()`, where it survives) — two routes to the
same wrong line (#4448).

The axis is the comment's distance from the **call**, not from the `let`: read off
the oracle, `let p = /* c */\n$props()` floats the comment forward while
`let p =\n/* c */ $props()` trails the declaration, so a comment is moved only
when nothing but blanks separates it from `$props(`. Newline-freedom alone is not
enough — `let { a, /* c */ ...rest } = $props()` satisfies it and upstream leaves
that comment in the pattern. The `$.prop(…)` form is deliberately untouched: with a default the comment belongs inside the call, which the lowering
already does, and moving it to the statement end would be a second wrong answer
instead of none.

Measured on 34 cells against Svelte 5.57.0 (the four grids for #4448, #4501,
#3515 and the newline axis): 10 go from divergent to byte-equal, 0 go the other
way. The plain destructure keeps the line break that is #4500, and the server
target is unchanged throughout.
