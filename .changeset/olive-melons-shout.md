---
'@rsvelte/compiler': patch
---

Decode the character after `$` instead of casting the byte when recognising a
store subscription in the SSR destructure expansion. The byte after `$` is a
non-ASCII name's UTF-8 lead byte, and `0xD7` — which leads the entire Hebrew
block — casts to `U+00D7` `×`, the one valid lead byte that is not alphabetic.
A Hebrew-named store therefore failed the check and the expansion emitted a
plain assignment to the subscription variable (`$אלף = $$value.a`) instead of
`$.store_set(אלף, $$value.a)`, so the store was never written.

No emitted output changes. This text pass is no longer on the SSR path for
component scripts — the AST pipeline lowers those, and it already writes
Hebrew- and CJK-named stores correctly.
