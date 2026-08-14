---
"@rsvelte/compiler": patch
---

Reduce `rsvelte_esrap` printer overhead by coalescing adjacent inline command text, skipping source-map anchors for plain output, avoiding line indexing for comment-free programs, and reserving the final output buffer. Release `rsvelte_esrap` 0.10.10 and update the compiler's exact dependency.
