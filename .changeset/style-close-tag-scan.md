---
"@rsvelte/compiler": patch
---

Stop ending a `<style>` block at a `</style>` that sits inside a CSS string, a `/* */` or `<!-- -->` comment, or an unquoted `url(…)`. Upstream never scans the block as raw text — `read_body` tests `parser.match('</style')` only at a rule boundary, so those occurrences are content — while rsvelte used a plain byte search and rejected `.a { content: "a</style>b" }` with `unexpected_eof`. The scan now mirrors the branch order of upstream's `read_value`; a non-CSS `lang` block in lenient (lint) mode keeps the plain search, since a SCSS `// don't` would otherwise open a string that never closes.
