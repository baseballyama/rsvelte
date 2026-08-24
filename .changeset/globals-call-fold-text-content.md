---
"@rsvelte/compiler": patch
---

Fold a call to one of upstream's 46 `globals` keypaths (`Math.*`, `Number`, `Number.*`, `String`, `String.*`, `BigInt`) in the client the way `scope.evaluate` does, so an element whose only child is such a value keeps the `textContent` fast path instead of emitting a text node and a `$.set_text` effect. The client carried its own eight-name `Math` table and reached it only when no binding was referenced at all, so `Math.abs(n)`, `Math.sign(n)`, `String(n)` and `Number(n)` over a never-written `$state` all lost the fast path. The value now comes from the server's table rather than a second implementation of it, which also fixes `Math.round(-0.5)` folding to `-1` where JS (and the server) give `0`. A local binding of the global's name, a spread argument, and a `Math.`/`Number.` member outside the eight `global_constants` keypaths are now all declined, matching upstream.
