---
'@rsvelte/compiler': patch
---

Place a comment left behind by TypeScript erasure where upstream places it. A
comment inside an erased `interface` or type alias preceding an `export let` was
unconditionally flushed after the `let` keyword; upstream only does that when the
source declaration has more than one declarator, and with a single declarator it
prints the comment ahead of `let`.
