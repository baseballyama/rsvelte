---
'@rsvelte/compiler': patch
---

Stop counting braces inside comments when splitting comma-separated declarations. A `}` in a comment made the splitter run one declaration into the next and emit a `const` declarator with no initializer, which does not parse.
