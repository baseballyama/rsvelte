---
'@rsvelte/compiler': patch
---

Stop a string literal's line continuation from gaining an indent (client) and from blocking constant folding (server). `const cont = 'a\<line break>b'` compiled to a component whose `cont` was `a\tb` — valid JavaScript computing the wrong string — because the client re-indenter treated the carried line as code. The same literal never entered the server's constants map, so the read stayed dynamic where official inlines it.

Also fixes a server fold that turned `'ab' + 'cd'` into the literal text `ab' + 'cd` (#2661): `starts_with` plus `ends_with` is not the question "is the whole expression one string literal".
