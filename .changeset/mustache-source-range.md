---
'@rsvelte/compiler': patch
---

Rewrite a svelte2tsx mustache tag by its brace positions, like upstream, so a wrapping paren in `{(a ?? '')}` survives and `{@html …}` leaves the single space it is replaced with.
