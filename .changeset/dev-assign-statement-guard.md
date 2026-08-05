---
"@rsvelte/compiler": patch
---

Only emit the dev `$.assign` coerced-proxy warning when the assignment's value is used. A template expression converted through the JSON path — an `{@attach}` body with a block, above all — had no such check, so a bare statement in one was wrapped.
