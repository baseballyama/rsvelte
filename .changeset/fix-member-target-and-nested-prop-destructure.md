---
"@rsvelte/compiler": patch
---

Two client destructuring-assignment fixes. A pattern whose only targets are member expressions off a `$state(...)` that resolves to a plain `$.proxy` (`({ b: o.p } = src)`) is no longer lowered through the reactive path: the "does this pattern touch anything reactive" check now consults the filtered set of names that actually became signals rather than every `$state` declaration, so the assignment stays verbatim like the official compiler leaves it. And in a runes script whose only reactive declarations are `$props()` — where the source-range transform runs instead of the text-based one — nested and renamed destructuring assignments (`({ a: { value } } = src)`) are now lowered instead of being emitted untransformed, so a nested prop leaf is written through its `value(...)` setter.
