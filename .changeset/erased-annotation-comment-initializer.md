---
'@rsvelte/compiler': patch
---

Flush a comment left inside an erased declarator annotation ahead of the
INITIALIZER, which is where upstream's printer puts it, rather than at the
annotation that was removed. Re-emitted at the removal point the comment sits
between the identifier and the `=`, and the client's legacy state lowering looks
for the literal `"<keyword> <var> ="`: the needle misses, the
`$.mutable_source()` wrapping is dropped, and the declaration keeps its raw value
while every read and write around it still goes through `$.get`/`$.set`.
