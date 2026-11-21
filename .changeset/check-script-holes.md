---
'@rsvelte/cli': patch
---

`rsvelte typecheck` now checks a component whose script has a syntax error with its props and default export, as svelte-check does, instead of reporting "has no default export" at each import of it. A dependency component the check cannot project now reads its module script's exports, as a project component does.
