---
'@rsvelte/compiler': patch
---

Decide every whitespace question in the parser with ECMAScript's whitespace set,
the one upstream's `is_whitespace(cc)`, `\s` regexes and `String.prototype.trim*`
all consult. The parser previously mixed three sets: Rust's Unicode
`White_Space` (which adds `U+0085` and drops `U+FEFF`), `u8::is_ascii_whitespace`
(which drops `U+000B`), and hand-written ASCII fast paths listing only space,
tab, LF and CR. Block open/close/continuation markers, tag and attribute names,
closing tags, snippet headers, the `{#each … as …}` alias separator, the
`{#await … then/catch}` keywords and the CSS reader all now agree with upstream
on `U+000B`, `U+000C`, `U+0085`, `U+FEFF`, `U+2028` and `U+2029`.
