---
"@rsvelte/compiler": patch
"@rsvelte/lint": patch
---

fix(parse): `PseudoClassSelector.args` is `null`, not absent, when the pseudo-class takes none

Upstream's `read_selector` builds every `PseudoClassSelector` with `args` in the
object literal and assigns `null` for an argument-less selector, so the public
`parse()` AST always carries the key. rsvelte inserted it only when it had a
value, so `:hover` came back without the field. Readers that asked "are there
args" by the key's presence now ask with `is_null`, which is the question
upstream's own consumers ask.
