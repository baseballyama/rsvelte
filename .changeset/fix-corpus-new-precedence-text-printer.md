---
"@rsvelte/compiler": patch
---

fix(compiler): parenthesize a `new` callee whose member spine contains a call (text printer)

`new $.get(deckgl).MapboxOverlay({ … })` was emitted by the text-printer fallback
without parenthesizing the callee, so it parses as
`(new $.get(deckgl)).MapboxOverlay({ … })`. The AST printer (esrap) already
guards this via `callee_has_call_expression`; the text printer's
`emit_new_expression` only parenthesized low-precedence callees (conditional,
await, …), not a member chain containing a `CallExpression`. Mirror esrap: walk
the callee's `Member`/`Call` spine and parenthesize when a call is found, emitting
`new ($.get(deckgl).MapboxOverlay)({ … })`.

Clears the SSR (server) output for `svelte-maplibre/.../DeckGlLayer.svelte`
(server known-failures 35 → 34). Its CSR output still differs on an orthogonal
axis (the client builds the effect body as a raw string, bypassing the AST
printer), so the client entry remains.
