---
"@rsvelte/compiler": patch
---

A known const chunk inside a dynamic `<svelte:head><title>` now folds into the template text the way upstream evaluates it (`` `Zoo — ${name}` ``, not `` `${site} — ${name}` ``).
