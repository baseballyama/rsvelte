---
"@rsvelte/compiler": patch
---

Prevent non-ASCII text from corrupting legacy client transform boundaries by keeping character and byte offsets as distinct types.
