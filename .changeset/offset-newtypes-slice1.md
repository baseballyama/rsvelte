---
"@rsvelte/compiler": patch
---

chore(compiler): give byte and char offsets distinct types

No behavioural change. `ByteOffset` and `CharOffset` replace bare `usize` at the
two offset-carrying signatures in the destructure transforms, so passing one
where the other is expected stops compiling instead of mis-slicing silently.
