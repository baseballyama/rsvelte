---
'@rsvelte/compiler': patch
---

Keep the statement slots a removed `$inspect(...)` leaves in a `.svelte.(js|ts)` module. Upstream
replaces the CALL with an empty statement and keeps the `ExpressionStatement` around it, so the
statement prints as `;;`; the module pipeline deleted the whole statement instead. The removal is
now AST-driven, so `$inspect(` spelled inside a string, a template literal or a comment is no
longer rewritten, and consecutive holes print as `;;\n;;` rather than merging into one run.

Normalise a raw `<CR>` in a template literal to `<LF>` in the SSR constant fold. ECMA-262 does that
in a template's cooked value; the fold read the literal from raw source text and rendered the
carriage return, so the SSR HTML disagreed with the client render.
