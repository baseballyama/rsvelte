---
"@rsvelte/compiler": patch
---

Keep a function expression's directive prologue. A `function () { 'use strict'; … }` written in a template attribute lost its leading string-literal statements, which the arrow and module paths already preserved.
