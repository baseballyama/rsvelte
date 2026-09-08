---
'@rsvelte/compiler': patch
---

A `.svelte.(js|ts)` module now decides `$.proxy` with upstream's deny-list instead of a text sniff, so a sequence expression, a tagged template, a parenthesised object and the dev-instrumented spellings of `await` and `===` keep their proxy. Previously they were stored unproxied, so mutating them did not invalidate — output that parses, runs and is not reactive.
