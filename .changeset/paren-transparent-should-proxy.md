---
'@rsvelte/compiler': patch
---

A parenthesized `$state` assignment right-hand side keeps its proxy in `compileModule`.

acorn builds no `ParenthesizedExpression`, so upstream's `should_proxy` decides on what the
parens hold. rsvelte ports that predicate twice: the AST port recurses through the pair, and
the text port used by the module path had no paren step at all — `is_top_level_function_call`
reads only an identifier callee and bailed on a leading `(` with a comment saying so. The two
predicates have opposite defaults (`should_proxy` returns false only for the shapes it
enumerates, the sniff returns true only for the shapes it enumerates), so every shape neither
recognised fell out unproxied.

Measured one cell per shape against `submodules/svelte` 5.56.10 in both hosts: 25 of 40 module
cells diverged and 0 of 40 component cells did, so the class is `compileModule`-only. Every
divergence ran one way, and the six agreeing paren cells — `(1)`, `('s')`, `` (`t`) ``,
`((x) => x)`, `(!a)`, `(a + b)` — are exactly the inner shapes `should_proxy` refuses, which is
what a "a leading `(` proxies" rule would have broken.

The ratchet carrier is `svelte-lexical/demos/qalam/src/lib/notesStore.svelte.ts`, and it
diverged only under `dev` because the await instrumentation rewrites the right-hand side into
`(await $.track_reactivity_loss(…))()` before the proxy decision reads it — one line of 166,
with the same source byte-equal in production.
