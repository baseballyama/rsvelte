---
"@rsvelte/compiler": patch
---

Strip TypeScript definite-assignment assertions (`let x!: T`, `class A { x!: T }`) so they no longer emit invalid JavaScript
