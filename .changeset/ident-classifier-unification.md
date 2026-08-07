---
"@rsvelte/compiler": patch
---

fix(compiler): stop gluing non-ASCII whitespace into identifiers in the client transform

`is_ident_start_byte` existed twice with the same `u8 -> bool` signature and
opposite answers on every byte `>= 0x80`. The client copy admitted them all, so
its identifier scan read `let<NBSP>count` as a single word and never saw
`count` — a missed identifier in a pre-filter whose own documentation says a
false negative is a correctness bug. Both copies now defer to one classifier
that decodes the character and applies the rule the official parser uses, and
the ASCII-only fast-path gates carry `ascii` in their names.
