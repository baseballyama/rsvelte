---
"@rsvelte/compiler": patch
---

Reduce `rsvelte_esrap` printer overhead by coalescing adjacent inline command text, skipping source-map anchors for plain output, and reserving the final output buffer. Release `rsvelte_esrap` 0.10.9 and update the compiler's exact dependency.
