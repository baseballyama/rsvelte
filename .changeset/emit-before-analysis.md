---
'@rsvelte/cli': patch
---

A `.svelte.ts` module is now analyzed as TypeScript emits it: a name of a dropped `import A = require("x")` or of a type import no longer exists, and `export =` and an import in a namespace are dropped too.
