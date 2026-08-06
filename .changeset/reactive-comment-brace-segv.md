---
"@rsvelte/compiler": patch
---

Fix a stack-overflow crash when a comment containing `}` or `)` appears inside a `$:` reactive block body
