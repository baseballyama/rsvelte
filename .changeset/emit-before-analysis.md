---
'@rsvelte/cli': patch
---

A `.svelte.ts` module is now analyzed as TypeScript emits it. A name that a dropped `import A = require("x")` binds no longer exists, and rsvelte drops `export =` too.
