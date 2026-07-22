---
"@rsvelte/compiler": patch
---

fix(parse): emit `FunctionDeclaration.expression` (always `false`) to match acorn's key order (`id`, `expression`, `generator`, `async`, `params`, `body`)
