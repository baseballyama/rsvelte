---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(parse): a binding pattern's TS annotation reaches the public AST

`catch (e: unknown)`, `{#each xs as x: T}` and `{@const x: T = …}` all dropped
the annotation: OXC keeps it beside the pattern (`CatchParameter`'s and
`VariableDeclarator`'s own `type_annotation`), and the three ports read only the
pattern. Upstream attaches it to the pattern node — with acorn's own span and
`loc` for a catch parameter or a `{const …}` declaration tag, and with the
hand-built node `read_type_annotation` produces (starting at the pattern's end,
no `loc`) for everything that goes through `read_pattern`.

svelte2tsx keeps that annotation too: `{:then value: T}` emitted
`const value = $$_value;` where upstream reads
`value.typeAnnotation?.end ?? value.end`.
