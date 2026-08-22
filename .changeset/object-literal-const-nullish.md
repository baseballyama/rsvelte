---
"@rsvelte/compiler": patch
---

Keep the `?? ''` on a `const` initialised with an object or array literal, and on every destructured `const`. Upstream's `scope.evaluate` has no case for either literal, so both fall through to `UNKNOWN` — which includes nullish — while rsvelte listed them alongside the function forms as definitely-defined.
