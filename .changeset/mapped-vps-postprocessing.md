---
"@rsvelte/vite-plugin-svelte": patch
---

Keep the returned source map valid across dev-server postprocessing: composing the HMR partial-accept and emitted-CSS-import edits no longer rewrites the map's `sources` into absolute paths or drops its `file`.
