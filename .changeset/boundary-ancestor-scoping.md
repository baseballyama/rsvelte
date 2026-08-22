---
"@rsvelte/compiler": patch
---

Scope an ancestor element whose matching descendant sits inside `<svelte:boundary>`, `<svelte:head>`, `<svelte:fragment>`, `<svelte:component>`, `<svelte:self>` or `<title>`. The walk that looks for the selector's subject enumerated the containers it descended into and stopped at those, so `<div class="b"><svelte:boundary><div class="a">` emitted `.b.svelte-hash .a…` while leaving the `.b` element without the hash — a rule that can never match. The default arm now descends into any remaining node's child fragments, which is what upstream's `get_element_parent` does by walking to the first element ancestor.
