---
"@rsvelte/compiler": patch
---

The client source map's comment coordinate space now starts above the source's last byte, so a real source position is never translated as if it were a comment offset
