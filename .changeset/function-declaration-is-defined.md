---
"@rsvelte/compiler": patch
---

Read a function declaration bare in a template interpolation. Its binding carries the declaration as its initial value, which evaluates to a function and so is never null, but rsvelte resolved only `const`-initialised bindings and appended a `?? ''` guard.
