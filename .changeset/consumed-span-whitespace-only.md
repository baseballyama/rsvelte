---
"@rsvelte/compiler": patch
---

client: a comment-buffer region that holds only a chunk separator is not a location

`to_oxc::consumed` gives a container the slice of the synthetic comment buffer
its children consumed. When they consumed only the `'\n'` each chunk is appended
with, that slice sits just past a *neighbouring* chunk's trailing comment, and
`has_loc` reads it as a real source position — so the arrow printer hands it to
the parameter list as the `until` bound and flushes an unrelated script comment
inside the parens.

A region with no non-whitespace byte holds neither a token nor a comment, so it
no longer becomes a span. `<svelte:boundary>` now drops the trailing script
comment as upstream does, and `{#key}` keeps it in the second argument's
parameter list where upstream puts it.
