---
'@rsvelte/cli': patch
---

`vuelte.compile` erases the TypeScript declarations at the top level of a script, which it used to print into its JavaScript: `type`, `interface`, `declare` and namespaces of types. It refuses the TypeScript that Svelte refuses.
