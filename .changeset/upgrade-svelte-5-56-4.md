---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

chore: upgrade the mirrored Svelte compiler to 5.56.4

Ports the two `packages/svelte/src/compiler` changes in 5.56.4: `{@const}`
declarator end now includes wrapping parentheses and its `VariableDeclaration`
starts at the `const` keyword (#18436), and optional-parameter `?` is stripped
in `svelte`-lang TS (#18448). svelte2tsx's `{@const}` handler is updated for the
new declarator span so it no longer duplicates the keyword (`const const x = …`).
