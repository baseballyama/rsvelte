---
'@rsvelte/cli': patch
---

rsvelte now erases the types of a `.svelte.ts` module before it analyzes it. A name that only a dropped `import A = require("x")` or a type binds no longer exists, and rsvelte drops `export =` too.
