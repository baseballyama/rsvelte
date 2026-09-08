# `prop-shadowed-local-read-on-a-mutation-rhs.svelte`

**Issue:** corpus residue

The read half of the same shadow. A prop member mutation transforms its right-hand side eagerly, before the outer walk that would have built a scope for it, so `items.selected = data` emitted `items(items().selected = data(), true)` — the prop's getter where official reads the local. The position cannot come from the converted expression: `JsExpr::Spanned` is attached only under `enable_sourcemap`, so keying on it would make the generated code depend on whether a map was asked for. The right-hand side's **source range** is available on both paths, so the bindings are asked which plain locals they declare inside it. `items.other = items` is the positive control, and the shape has **0 occurrences in 34,728 corpus entries** — the fix moves no real-world output.
