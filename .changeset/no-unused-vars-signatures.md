---
'@rsvelte/cli': patch
---

`no-unused-vars` in a component now follows typescript-eslint's rule, as oxlint's does. It no longer reports the parameters of a function type such as `(mode: string) => void`. A report covers the name without its type annotation.
