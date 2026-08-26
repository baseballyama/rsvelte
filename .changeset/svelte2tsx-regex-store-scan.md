---
"@rsvelte/svelte2tsx": patch
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
---

Ignore `$name` spellings inside instance-script regular-expression literals when collecting svelte2tsx store subscriptions and snippet-hoisting constraints. A regex containing an exported prop's name previously injected a false store declaration at the prop widener's insertion point and left an unmatched `/*Ωignore_startΩ*/` marker in the generated TSX.
