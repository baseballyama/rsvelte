---
'@rsvelte/cli': patch
---

`typecheck` now reads a JavaScript component that a package import reaches as untyped when `allowJs` is on, as svelte-check does. TypeScript loads such a component only within `maxNodeModuleJsDepth`, so beyond it the import reports TS7016, its props are not typed, and the component itself is not checked.
