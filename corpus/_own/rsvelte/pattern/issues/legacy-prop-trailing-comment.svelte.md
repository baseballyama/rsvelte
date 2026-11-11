# `legacy-prop-trailing-comment.svelte`

**Issue:** corpus residue

A same-line comment after a legacy `export let` follows the initializer into the final argument of the generated `$.prop(...)` call. The assignment makes the prop updated so the production `flags = 12` path from AdventureLog is exercised, and the line comment forces the closing parenthesis onto the next line.
