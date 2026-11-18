# `3322-new-expression-static.svelte`

**Issue:** [#3322](https://github.com/baseballyama/rsvelte/issues/3322)

`{new String(s)}` over a non-reactive `let`. `NewExpression` reached no arm of the client expression-property walk, so the catch-all marked it reactive and the text got a `$.template_effect` where official assigns `nodeValue` once. Upstream's `NewExpression` visitor only calls `context.next()` — every flag comes from the callee and the arguments
