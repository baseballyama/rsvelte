---
"@rsvelte/compiler": patch
---

Dev-mode client output now applies ownership validation to member-expression mutations of a `$props()` prop, e.g. `$effect(() => { listEl.style.overflow = "hidden"; })`. In runes mode a prop read only becomes the `listEl()` getter call in the post-loop AST pass, but the `$$ownership_validator.mutation(...)` wrapper was applied earlier, inside the per-statement text pipeline, where its matcher could not yet see that form — so every such mutation shipped unvalidated and the `$.create_ownership_validator($$props)` preamble was dropped with it. The wrapper now runs once over the finished instance script, and each mutation resolves its own line/column instead of every occurrence reusing the first one's position.
