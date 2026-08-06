---
"@rsvelte/compiler": patch
---

fix(compiler): match destructuring brackets lexically

`find_matching_open_bracket` walked backwards counting every `{`/`[` it saw,
including ones inside string literals and comments. A destructuring assignment
whose pattern carried a brace in a default value (`{ a = "}" } = obj`) or in a
comment failed to find its opening bracket and was left untransformed.
