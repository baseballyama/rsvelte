---
"@rsvelte/compiler": patch
---

fix(analyze): decide `$derived`-beside-`derived` by the import's source, not by scanning the script text. `import{derived}from"svelte/store"` — no space after the keyword — was not recognised as a `svelte/store` import, so `$derived(...)` compiled as a store subscription on both the client and the server.
