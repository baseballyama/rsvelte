---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a component in a workspace dependency that imports through the dependency's own package.json `imports` (`#ui/utils.js`) now resolves from the dependency's files, as official svelte-check does, instead of reporting TS2307 inside the dependency and typing its exports as `any` for the consumer. The rewritten import names a TypeScript file by its JavaScript extension (`./utils.js` for `utils.ts`, `./decl.js` for a `types` target `decl.d.ts`), and the import resolver maps `.js` / `.jsx` / `.mjs` / `.cjs` back to their TypeScript sources as TypeScript does.
