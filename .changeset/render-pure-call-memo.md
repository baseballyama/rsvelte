---
"@rsvelte/compiler": patch
---

Match Svelte's purity-aware memoization of `{@render}` arguments, leaving pure calls inline while continuing to memoize impure and reactive calls.
