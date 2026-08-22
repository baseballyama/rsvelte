---
"@rsvelte/compiler": patch
---

Stop the dev-mode `$.assign` wrapper from firing when the assigned value is statically primitive: a call into the known-globals table (`String`, `Number`, `BigInt`, `Math.*`), a global constant such as `Math.PI`, or a function expression. The globals table is now name-for-name upstream's, so a near-miss like `Math.nope()` no longer reads as known either.
