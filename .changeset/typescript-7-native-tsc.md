---
"rsvelte-check": patch
---

Prefer TypeScript 7's native `tsc` over the legacy `@typescript/native-preview` `tsgo` binary when `--tsgo` is passed and the workspace resolves `typescript@>=7`.
