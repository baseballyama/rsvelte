---
'@rsvelte/compiler': patch
---

Reject a TypeScript namespace with non-type nodes through every modifier: `export namespace N { … }`, `declare module "x" { … }` and `declare global { … }` now raise `typescript_invalid_feature` at upstream's span instead of compiling.
