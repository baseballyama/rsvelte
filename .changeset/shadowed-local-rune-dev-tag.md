---
"@rsvelte/compiler": patch
---

Transform a shadowed function-local `$state` / `$derived` through its signal in dev mode too. The declaration probes matched the literal `<kw> <name> = $.state(` text, but in dev the `$.tag(...)` label wrap already sits between the `=` and the rune call, so the reads and writes in the enclosing function body were left bare.
