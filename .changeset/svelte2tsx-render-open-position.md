---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

Three fixes to where `function $$render()` opens relative to a hoisted type
declaration. All three decide the same thing — which instance-script types may
move above `$$render()` — and each was wrong in a different direction.

A `type T = $$Generic` alias name was not treated as a generic in scope on
`$$render<T>()`, so an `interface Props { a: T }` was hoisted to module scope
where `T` does not exist. `Generics.getReferences()` is filled from both the
`generics="…"` attribute and every `$$Generic` alias, and that is the set
`moveHoistableInterfaces` adds to `disallowed_types`.

`$$Props`, `$$Slots` and `$$Events` were excluded from the hoist candidates
outright. Upstream calls `analyzeInstanceScriptNode` on every top-level node, so
those three are ordinary candidates there and hoisting them is what shifts
everything after them by a line.

A shorthand name in an object binding pattern inside a type — the `title` of
`textFactory: ({ title }: { title: string }) => string` — was read as a value
reference by the lexical dependency scan, so a prop of the same name blocked the
hoist. Upstream collects type references from the AST, where such a name is not
one.
