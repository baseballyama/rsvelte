---
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

fix(check,lsp): a project that sets `outDir` (or `declarationDir`, `sourceRoot`, `mapRoot`) without `rootDir` no longer gets TS6059 "not under 'rootDir'" for every source under TypeScript 6+. The generated overlay tsconfig now states the `rootDir` TypeScript would default to for the project's own config, and only when one of those options makes TypeScript compare sources against it, so a project without `outDir` that imports a sibling package through `paths` is not newly reported. With a TypeScript 5 `tsc` backend, where the default is the common source directory, nothing is added unless `composite` is set.
