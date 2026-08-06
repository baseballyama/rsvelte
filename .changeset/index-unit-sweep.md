---
"@rsvelte/compiler": patch
---

fix(compiler): return byte offsets from two more position scanners

`find_destructuring_pattern_end` and `find_simple_assignment` counted characters
while their callers sliced the same string by bytes, so a non-ASCII identifier or
string literal in a destructuring pattern or a `let` initialiser sliced short —
`let { café } = obj` lost its closing brace — and a multi-byte character straddling
the offset panicked outright.
