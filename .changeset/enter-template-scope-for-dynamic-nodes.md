---
"@rsvelte/compiler": patch
---

Resolve a `{#snippet}` from a `{@render}` that sits beside it under `<svelte:component>`, `<svelte:self>` or `<svelte:element>`. The scope builder registers a template scope for each of those nodes, but only the plain-component visitor entered it, so a sibling snippet's binding was invisible and the render tag was marked dynamic. That reached the output twice: the tag compiled to the indirect `$.snippet(...)` helper instead of a direct call, and — because a fragment counts as standalone only when its one child is a *non-dynamic* render tag — the enclosing slot gained a `<!---->` anchor the official compiler omits.
