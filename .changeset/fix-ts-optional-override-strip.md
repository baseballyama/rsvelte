---
"@rsvelte/compiler": patch
---

Strip the TypeScript optional marker (`x?: T`, `m?(): void`) and the `override` modifier from class members, which previously leaked into the generated JS and made it unparseable
