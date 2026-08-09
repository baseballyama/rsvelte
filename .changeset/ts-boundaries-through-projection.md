---
"@rsvelte/compiler": patch
---

Place TypeScript statement boundaries through the strip projection, so the client
instance-script pipeline reuses the program Phase 1 already parsed instead of
parsing the script a second time.
