---
"@rsvelte/compiler": patch
---

Stop the SSR constant-fold from inlining a `const` alias of a variable that is written. `let w = 1; w += 2; const r = w;` rendered `<b>1</b>` on the server instead of `<b>3</b>`: the fold resolved `r` from `w`'s initializer and only afterwards dropped `w` for being reassigned, so the value it had already leaked into `r` survived. The client was byte-identical to the official compiler throughout, so the wrong value shipped as a hydration mismatch rather than a crash.
