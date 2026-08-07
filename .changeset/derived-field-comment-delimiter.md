---
'@rsvelte/compiler': patch
---

Count brackets lexically when finding the end of a rune's argument on the server

`find_matching_paren_server` scanned with a bare `char_indices()`, so a `)` or `}` inside
a comment or a string literal closed the count early. A multi-line `$derived(() => ({…}))`
class field then lost its closing `))` and the module stopped parsing with
`missing ) after argument list`.
