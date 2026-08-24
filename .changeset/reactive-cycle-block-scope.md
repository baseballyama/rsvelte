---
'@rsvelte/compiler': patch
---

Resolve a name declared inside a `$:` statement to that declaration rather than to the instance binding of the same name. A `catch (e)` parameter, a block `let`/`const e`, and a `for` head's own binding were all attributed to the outer `e`, so a second reactive statement assigning `e` was reported as `reactive_declaration_cycle` on code the official compiler compiles. A function parameter was already scoped correctly, which is what made this a scoping gap rather than a missing feature; the shadowing is per block, so an inner block does not silence an outer read of the same name
