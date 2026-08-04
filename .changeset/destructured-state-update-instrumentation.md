---
"@rsvelte/compiler": patch
---

fix(compiler): decide the non-reactive shadow per binding name. A destructuring
pattern can mix a reassigned `$state` binding with a never-reassigned
(non-reactive) sibling, but the client transform made that decision over the
whole pattern: `let [a, b] = $state([1, 2])` where only `a` is reassigned
registered both names in the program scope's shadow set, so every transform for
`a` was suppressed and `a++` was emitted verbatim instead of `$.update(a)`.
The decision now happens per binding name, matching official.
