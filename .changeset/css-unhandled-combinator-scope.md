---
'@rsvelte/compiler': patch
---

Stop scoping — and stop pruning against — the part of a CSS selector that sits to the left of a combinator the official compiler does not handle, such as `||`
