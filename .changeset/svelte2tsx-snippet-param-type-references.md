---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

fix(svelte2tsx): a top-level snippet whose parameter type annotation or default value references an instance-script value (`{#snippet s(r: ReturnType<typeof c.raise>)}`) now stays inside `$$render` as upstream does. Only the names a parameter binds shadow outer references; identifiers in its annotation or default were wrongly treated as parameters too, so the snippet was hoisted to module scope where `c` is not in scope.
