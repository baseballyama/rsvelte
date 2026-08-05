---
'@rsvelte/compiler': patch
---

Memoize a template chunk whose pure-callee call reads a binding

`{Math.ceil(a / b)}` was folded to a literal instead of being memoized as a
`$.template_effect` dependency: upstream marks a call `has_call` when the callee
is impure **or** the expression records any dependency, and every resolved
identifier is a dependency — even a compile-time-known `const`. The `has_call`
bail is now also confined to the template expression itself, so a constant still
folds when it reaches the template through a binding's initializer.
