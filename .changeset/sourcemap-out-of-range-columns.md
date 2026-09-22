---
"@rsvelte/compiler": patch
---

fix(sourcemap): a segment's original column stays inside the line it names

Both ports derived a source column by *arithmetic* on a resolved one, so nothing
re-checked which line the result landed on. The client printer anchors a
keyword's end at `column + keyword.len()`, which runs off the end of the line
whenever the keyword is longer than the source token it stands for; the server
token scan read `text.is_ascii()` as "this token stays on one line", which a
string literal with a line continuation does not. Over
`compatibility/pattern-corpus` that produced 87 segments (client 77, server 10)
naming a column the source line cannot hold; it is now 0, and
`compatibility/sourcemap-known-failures.json` is empty.
