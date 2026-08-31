---
"@rsvelte/compiler": patch
---

A multi-declarator `const a = $derived(await p), b = $derived(await q);` preceded by an own-line comment no longer leaks that comment into the generated async callback's parameter list, and keeps the `$.template_effect` promise dependency it had.
