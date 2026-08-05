---
"@rsvelte/compiler": patch
---

Name only arrow-function event handlers in dev mode, matching the official compiler's `dev && handler.type === 'ArrowFunctionExpression'` guard. Naming a non-arrow handler consumed a `scope.generate()` slot, which shifted every later identifier sharing the prefix — including element variables, since `<input on:input>` draws `input` from the same counter.
