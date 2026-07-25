---
"@rsvelte/lint": patch
---

fix(lint): treat lone CR as a line break in diagnostic line/column computation

`LineIndex` only split lines on `\n`, so a lone `\r` (old Mac-style line
ending) with no following `\n` was not counted as a line break. Diagnostic
line/column positions after such a `\r` were therefore off, unlike ESLint's
text model, which treats `\r`, `\n`, and `\r\n` all as line terminators.
