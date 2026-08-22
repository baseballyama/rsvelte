---
'@rsvelte/compiler': patch
---

Resolve a rune-spelled name against its binding before treating it as a rune. A slot that only BINDS the name — a statement label, a `catch` parameter, a nested `const`/`function`/`class`, a destructuring or loop binding — no longer flips a Svelte 4 component into runes mode (and so no longer rejects its `export let` or the declaration itself), and a `.svelte.(js|ts)` module's local named after a rune is called rather than lowered. A parenthesised rune call in a declarator (`let v = ($state(1))`) is also lowered now: acorn builds no `ParenthesizedExpression`, so upstream never saw one, and rsvelte left the rune name in the generated module.
