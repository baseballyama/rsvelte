---
'@rsvelte/compiler': patch
---

Stop a `;` or `)` inside a comment from ending a legacy `let` initializer, and keep the generated `)` out of a trailing line comment. `let x = a + // ; c` emitted `$.mutable_source(a + //); c` — the generated paren spliced into the comment body — which no JavaScript parser accepts.
