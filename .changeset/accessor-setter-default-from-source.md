---
"@rsvelte/compiler": patch
---

fix: print the accessor setter's default from source, not as an AST dump

`set p($$value = <default>)` took its default from `binding.initial`, a field
that holds a literal's raw text for some shapes and a JSON dump of the node for
all the rest — so every non-literal `$props()` default (`{}`, `[1]`,
`new Map()`, `() => 1`, `` `t` ``, `1 + 1`, `-1`) reached the output of a
`customElement` or `accessors` component as serialized ESTree. The result
parses, so a custom element instantiated without the attribute silently
received the node.

The default now comes from the initializer's source span, with TypeScript
nested inside it erased through the same parser the rest of the pipeline uses.
