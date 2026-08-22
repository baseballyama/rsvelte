---
'@rsvelte/compiler': patch
---

Reject two `{#snippet}` blocks that declare the same name in one scope with `declaration_duplicate`. A snippet declares with `Function`, which the duplicate check exempts so a TypeScript overload set stays legal — two snippets are not an overload set, and the second one silently won
