---
"@rsvelte/compiler": patch
---

Print statement bodies in `print`'s ESTree fallback instead of replacing them with a placeholder: a `BlockStatement` came back as the literal `{ /* block */ }`, and `if`/loop/`try`/function/class bodies as `{ /* ... */ }`, all returned as a successful print. The placeholder reached 528 of the 4,468 `.svelte` files in the Svelte test suite. The fallback now also reconstructs the parentheses the tree does not carry, so its output parses.
