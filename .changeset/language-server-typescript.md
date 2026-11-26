---
'@rsvelte/cli': minor
---

`rsvelte lsp` now offers TypeScript's hover, completion, signature help, definitions, references, highlights and renames in Svelte components, from the TypeScript 7.1 that `rsvelte typecheck` runs; `--no-typescript` turns them off. The Visual Studio Code extension leaves them to the Svelte extension where that one is installed, unless `rsvelte.typescript` says otherwise.
