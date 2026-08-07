---
'@rsvelte/compiler': patch
---

Delete the non-ASCII arm from the parser's trailing whitespace-only text trim.
The predicate ran under `all()`, so every byte of the text had to satisfy it,
and the lead byte of any multi-byte character casts to a non-whitespace Latin-1
character — the arm could never be the deciding term. Trailing non-ASCII
whitespace is already dropped upstream by the `trim_end()` that sets
`content_end`, which is what matches official Svelte's `template.trimEnd()`. No
behaviour change; the arm only ever looked like Unicode support.
