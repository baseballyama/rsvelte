---
'@rsvelte/compiler': patch
---

Read the character adjacent to a match in the client transforms, not the byte. Twelve
word-boundary and whitespace scans in the class, state, store and prop transforms decided
what sits next to a match from `bytes[i] as char`, which Latin-1-decodes one byte of a
UTF-8 sequence: `א`'s lead byte reads as `×` (not alphanumeric) and `名`'s trailing byte as
a C1 control, so a letter inside an identifier looked like a word boundary — `this.#cא`
compiled to `log($.get(this.#c)א)`, which is not JavaScript — while `U+3000` and NBSP, whose
lead bytes decode to letters, were not recognised as the whitespace they are.
