---
"@rsvelte/compiler": patch
---

Stop the SSR constant fold from inlining a `let`'s initializer after a write

`extract_constant_vars` already dropped a reassigned `let`, but the drop ran after the pass
that resolves a `const` from another binding, so `let w = 1; w += 2; const r = w;` removed `w`
and kept `r` at `1` — nothing removes `r`, because `r` itself is never written. The drop now
runs before that pass as well, and its operator list covers every compound assignment instead
of six of them. The client was byte-identical to official throughout; only the server rendered
the wrong text.
