---
"@rsvelte/compiler": patch
---

Fold the three `globals` entries the server answered with a type marker. Upstream stores `[type, fn?]` per keypath and folds when `fn` is present and every argument is known; `String.fromCharCode`, `String.fromCodePoint` and `Math.f16round` all have an `fn`, but rsvelte reported a `STRING`/`NUMBER` marker for them, so a known value read as unknown and the chunk was not folded into the SSR template. `BigInt` and `Math.random` are the only two entries upstream really does store without one, and they stay unfolded.
