---
'@rsvelte/compiler': patch
---

End a destructuring assignment's right-hand side at the line break when the source omits the semicolon, so semicolon-free code no longer emits an unclosed IIFE call
