---
"@rsvelte/compiler": patch
---

Treat a conditional or logical expression whose sides are both known-defined as defined, so `<option value={a ? 'x' : 'y'}>` no longer keeps a `?? ''` around the `__value` assignment that the official compiler drops.
