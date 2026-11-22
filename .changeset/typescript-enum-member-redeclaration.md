---
'@rsvelte/cli': patch
---

`compile` now refuses a TypeScript `enum` with a repeated member as svelte does, with `typescript_invalid_feature`, instead of reporting the repeated name.
