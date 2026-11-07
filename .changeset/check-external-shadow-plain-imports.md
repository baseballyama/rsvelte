---
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

fix(svelte-check): a component shadow of an external (workspace-sibling) package now resolves its relative imports of plain source and `.svelte.ts` modules to the package's own files. Through the overlay's pooled `rootDirs` they could reach another package that shares the relative path, and which one won depended on the host's directory order, so one monorepo type-checked differently on macOS and Linux. External packages are now numbered in sorted order, and a cached `ext/<n>` mirror that belonged to another package is cleared before it is reused.
