---
"@rsvelte/compiler": patch
---

fix: a spread argument stops a `globals` call from reading as known-defined

Upstream's `globals` branch in `scope.evaluate` requires both that the callee
keypath is in the table AND that no argument is a `SpreadElement`. rsvelte's
server port had the guard; the client asked the table alone at three of its six
call sites, so `{Math.max(...xs)}` lost its `?? ''` and rendered `undefined` as
the empty string only by accident.

The guard is now a parameter of the predicate, and the predicate itself lives in
`2_analyze/scope.rs` — one table where upstream keeps it. That closed a second
divergence: the phase-2 copy matched `Math.` and `Number.` by prefix, so
`Math.nope(n)` read as a known global while `String.nope(n)` did not.
