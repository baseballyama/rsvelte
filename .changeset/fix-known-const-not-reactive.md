---
"@rsvelte/compiler": patch
---

fix(transform): treat a `const` with a compile-time-known initializer as non-reactive

A reference to a `const` whose initializer is a constant-foldable expression
(`const chartHeight = topPadding + barSize * n`, `const path = `M${cx - r},${cy}``
where the operands are literal consts) was classed as reactive, so a component
prop reading it emitted a spurious `$.derived(...)` + `get x()` where the
official compiler keeps a plain `x: value`. rsvelte already ports upstream's
`scope.evaluate(node).is_known`, but the binding's initializer AST was only kept
for interpolated template literals, so any other constant expression fell back
to "reactive". The analyzer now also stores the initializer AST for
`Binary`/`Unary`/`Conditional`/`Identifier`/`Member` (and non-empty template)
initializers on both the runes and legacy declarator paths, and the known-value
evaluator recurses through a referenced `const`'s stored initializer, so
constant chains fold. Only ever removes spurious reactivity (unknown
expressions — calls, arrays, objects — stay reactive), matching the official
compiler.
