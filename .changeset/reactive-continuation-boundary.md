---
"@rsvelte/compiler": patch
---

fix(compiler): keep a legacy `$:` statement whole across a `//` line

The two accumulation loops in the server legacy `$:` reorder disagreed on
whether a `// …` line ends a continuation. They now share one line
classification, and a comment neither ends the statement nor completes it, so
`$: total =` / `// c` / `a + b;` stays one statement as official emits it.
