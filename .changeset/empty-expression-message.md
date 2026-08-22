---
'@rsvelte/compiler': patch
---

Report an empty expression body — `{@html }`, `{@attach }`, `{}`, `{#if }`, `{#key }`, an empty attribute value — as `Unexpected token` rather than `Empty parenthesized expression`. The expression probe wraps its input in `(…)` before handing it to the JS parser, so a body with no code in it produced the parser's message for `()`: a diagnostic describing the wrapper rather than the source. Whitespace-only and comment-only bodies are the same case, and are now recognised by parsing rather than by trimming, so a `/*` inside a string literal is not mistaken for a comment
