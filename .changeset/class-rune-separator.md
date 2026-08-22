---
"@rsvelte/compiler": patch
---

Lower a class rune whose `=` is not followed by exactly one space

The client class-field and constructor-assignment scanners located a rune with
`memmem::find(b"= $state(")` and rebuilt the assignment as `format!("{} = {}", target, value)`.
Both spellings carry one ASCII space, so a tab, two spaces, a non-ASCII JS space (U+00A0,
U+FEFF, U+3000, …) or a block comment between the `=` and the rune left the field unlowered:
the output parsed and ran, and the field held a `Source` object with no reactivity. A comment
separator is now preserved in the emitted initializer, and the dev-mode `$.tag(…)` wrap keeps
a one-line comment inline instead of reflowing the call.
