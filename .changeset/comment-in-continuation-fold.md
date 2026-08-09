---
"@rsvelte/compiler": patch
---

Fold a line-continuation string constant when a comment sits between `=` and the value

`join_continuation_lines` reconstructs logical lines for `extract_constant_vars`,
and it copied comment text into that reconstruction. A comment then landed in
front of the declarator's value, where `is_whole_string_literal` tests the first
byte, so the constant was never recorded and the SSR output read it at runtime
instead of folding it — output that runs correctly and differs from official's.

Comments now become a single space. That is the whole of the difference the sole
consumer can observe: it reads values, and a comment carries none.
