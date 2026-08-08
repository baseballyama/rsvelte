---
'@rsvelte/compiler': patch
---

Trim the template's trailing whitespace with ECMAScript's whitespace set, the
one behind official Svelte's `template.trimEnd()`, instead of Rust's Unicode
`White_Space` property. The two sets both have 25 members but differ on exactly
two, in opposite directions: `U+0085` NEL is Unicode whitespace and not JS
whitespace, so a trailing NEL was trimmed where official keeps it as a text
node; `U+FEFF` ZWNBSP is JS whitespace and not Unicode whitespace, so a trailing
ZWNBSP survived where official drops it. Both reached the emitted template, not
just the AST.
