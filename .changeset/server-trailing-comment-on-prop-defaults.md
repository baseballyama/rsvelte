---
"@rsvelte/compiler": patch
---

Server: a comment trailing an `export let x = <literal>` declaration now prints inside the `$.fallback(...)` call, where upstream puts it, instead of after the statement. The lowering blanked the default's source coordinates and the comment placement declined to carry the region because it blanked, so neither half could move alone.
