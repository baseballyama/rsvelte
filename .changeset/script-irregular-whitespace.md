---
"@rsvelte/compiler": patch
---

Reject `U+200B` (ZWSP) and `U+0085` (NEL) in a `<script>` body, as upstream does. Neither is ECMAScript `WhiteSpace` or `LineTerminator` — `U+200B` has been `Cf` rather than `Zs` since Unicode 4.0.1 — so acorn, and therefore the official compiler, raises `js_parse_error` on a program that carries one between tokens. oxc's `is_irregular_whitespace` admits both, so rsvelte compiled them. The verdict now comes from the `irregular_whitespaces` spans oxc itself reports, filtered by the ECMAScript set, which leaves the same character accepted inside a string literal or a comment.
