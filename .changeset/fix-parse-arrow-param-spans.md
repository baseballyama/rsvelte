---
"@rsvelte/compiler": patch
---

fix(parse): assign real spans to fast-path arrow-function parameters

A top-level mustache/attribute arrow handler (e.g. `onclick={(color, e) => …}`)
went through a fast-path parser that stamped its parameters with a zero-width
`Identifier[0,0]` span and no `loc`, diverging from svelte/compiler (which
assigns each parameter its real source span). The fast path now derives each
parameter's absolute span from its byte position within the source, matching
svelte/compiler. Compiled output is unchanged.
