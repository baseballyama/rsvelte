# `2592-destructure-assignment-line-break.svelte`

**Issue:** [#2592](https://github.com/baseballyama/rsvelte/pull/2592)

A destructuring **assignment** with no terminating semicolon — the RHS ends at the **line break**, or the scan runs on through the statements that follow and emits `(($$value) => {…})(rhs` unclosed, which is not JavaScript. The same line break makes it an expression *statement*, so the IIFE must not `return` its value; the `out = ([selected] = result)` declaration pins the other side, where the value **is** used and the `return` must stay. Kept deliberately unformatted: the formatted form (`[selected] = result;`) does not reproduce, so the fmt oracle's rewrite is the point, not a lapse
