---
"@rsvelte/lint": patch
---

`svelte/prefer-const` no longer reports a `let` that is declared twice in one scope. ESLint's scope analysis merges a redeclaration into a single variable carrying two write references, which its single-writer check rejects.
