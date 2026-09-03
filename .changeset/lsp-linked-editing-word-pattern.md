---
'@rsvelte/language-server': patch
---

`textDocument/linkedEditingRange` returns a `wordPattern` that accepts its own ranges.

The protocol says the pattern describes valid contents for the ranges returned beside it, and a
client uses it to decide whether an in-flight edit still applies. rsvelte sent a pattern that
rejected the contents of the very ranges it accompanied — a tag name containing a `.`, such as
`Foo.Bar`, failed to match — so a client validating an edit against it would stop applying the
linked rename partway.

The pattern is now byte-identical to the official server's, which is VS Code's default word
pattern. The ranges themselves already agreed with official on every measured case; only the
pattern diverged.
