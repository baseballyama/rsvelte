---
"@rsvelte/compiler": patch
---

Locate `.svelte.(js|ts)` module rune calls lexically: a `$derived(` inside a string, template or comment aborted the lowering loop and left the real rune call in the output (the module then threw `$derived is not defined` at import), and a regex literal carrying the same text was rewritten into a different regular expression.
