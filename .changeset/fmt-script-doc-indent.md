---
"@rsvelte/fmt": patch
---

Embed a `<script>` body the way the oracle does — as a Doc under `indent([hardline, body])` — instead of formatting it to text at a narrowed width and re-indenting the text.

The narrowing was an approximation of the indent: the body was formatted one indent level narrower so a line exactly `printWidth` wide would not overflow once re-indented. That gets the budget right and the *measurement* wrong, because prettier does not reduce `printWidth` for embedded content at all — it keeps the body as a Doc, wraps it in `indent(...)`, and prints it as part of the outer document, so every line is measured at the column it will actually occupy.
