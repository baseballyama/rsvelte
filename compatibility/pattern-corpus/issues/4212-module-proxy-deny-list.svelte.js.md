# `4212-module-proxy-deny-list.svelte.js`

**Issue:** #4212

`compileModule` decided `$.proxy` with a text sniff defaulting to `false`, while upstream's `should_proxy` is a deny-list defaulting to `true`, so every shape the sniff had no predicate for was stored unproxied and did not invalidate. The carriers are a sequence expression, a tagged template, a parenthesised object, and the dev-instrumented spellings of `await` and `===` — at a `$state(…)` declaration and at an assignment to one. `controls()` holds every deny-list shape and every already-proxied shape, because flipping a default is a change *toward* proxying and only a passing cell can report the over-reach. Zero real-world files carry any of these shapes, so this is the only carrier the gate has.
