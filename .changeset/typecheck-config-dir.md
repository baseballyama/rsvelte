---
'@rsvelte/cli': patch
---

`typecheck` now reads `${configDir}` in `tsconfig.json` as the directory of the checked `tsconfig.json`, as `tsc` does, also when an extended one has it. Before, `typecheck` still checked a file that such an `exclude` pattern removes.
