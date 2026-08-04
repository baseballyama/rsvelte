---
"@rsvelte/compiler": patch
---

Detect `$$Slots` / `$$Events` / `$$Props` interface and type-alias declarations in svelte2tsx output even when nested inside a function, block, or class body — matching official svelte2tsx's fully recursive instance-script walk instead of only scanning top-level statements.
