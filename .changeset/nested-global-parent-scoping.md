---
'@rsvelte/compiler': patch
---

A `&` whose parent rule is entirely `:global(...)` scopes every element, the way upstream's `NestingSelector` case does — eight components had lost the scoping class on most of their markup
