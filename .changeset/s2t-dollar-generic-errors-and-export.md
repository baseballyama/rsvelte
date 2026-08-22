---
"@rsvelte/svelte2tsx": patch
---

Raise the three `$$Generic` errors upstream raises — in the module script, alongside a `generics` attribute, and with more than one type argument — and recognise the declaration when it carries an `export` modifier, which upstream models as one type alias with a modifier so its matcher reaches it. The `$$Generic` reference is now matched on the AST rather than on the annotation's source text, so `type T = $$Generic < string >` is recognised too.
