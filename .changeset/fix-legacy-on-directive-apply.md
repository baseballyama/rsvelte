---
"@rsvelte/compiler": patch
---

fix(compiler): route a legacy `on:` event handler through `$.apply` in dev, like the modern `onclick={…}` path already did, so a throwing handler is reported with its component and source position
