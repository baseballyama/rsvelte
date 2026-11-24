---
'@rsvelte/cli': patch
---

`typecheck` now reads a file that only an import reaches as `tsc` does, such as a file of a package linked into `node_modules`. It made every such file a root of the project before, so with `outDir` set it reported TS6059 for a linked package's file, which `tsc` does not.
