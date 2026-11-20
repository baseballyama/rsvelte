---
'@rsvelte/cli': patch
---

`svelte/no-immutable-reactive-statements` reads the type references of a reactive statement, so an undeclared type or a `typeof` of a reassigned variable makes the statement reactive as in eslint-plugin-svelte.
