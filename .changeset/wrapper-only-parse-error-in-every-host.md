---
'@rsvelte/compiler': patch
---

Stop reporting a parse error the expression wrapper produced

A template expression is parsed by wrapping it as `(<body>\n)`, and that `(` makes
OXC speculate an arrow parameter list — so `{accessor satisfies string}` was a
`js_parse_error` in every template host while the identical body compiled inside
`<script>`. The conversion path now retries the body with a newline in place of the
`(`, which is the same one byte and keeps every caller's offset arithmetic intact. A body that is not a lone expression on its own is
rejected exactly as before.
