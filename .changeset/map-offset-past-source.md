---
"@rsvelte/compiler": patch
---

Stop emitting client source-map segments whose source offset is past the end of the source: an untranslated chunk coordinate resolved to a position no source line can hold.
