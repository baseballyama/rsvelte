---
'@rsvelte/compiler': patch
---

fix(esrap): keep a redundant paren pair only for a comment that leads the parenthesized expression, so `(await $.track_reactivity_loss(/* c */ load()))()` no longer prints a doubled pair
