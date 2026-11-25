---
'@rsvelte/cli': patch
---

`compile` drops an `import A = require("x")` from a `.svelte.ts` module, as TypeScript's emit for an ES module does.
