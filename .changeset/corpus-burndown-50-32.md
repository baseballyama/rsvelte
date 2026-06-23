---
"@rsvelte/compiler": patch
---
Phase-3 corpus CSR/SSR byte-parity burndown: known-failures 50 → 32 (16 root-cause
fixes). Server: each-item shadows same-named component `$derived` in the read-wrap
pass; module `$state.snapshot(x)` strips to bare `x` for declarator inits; destructured
`export let` lowering gets per-`ArrayPattern` `$$array_N` naming + `$.fallback` defaults
+ `RestElement`; component trailing `<!---->` anchor is kept in preserve-whitespace
context; constant-fold decodes `\u`/`\x` escapes. Client: a static `<input checked>`
child no longer forces its parent to be traversed; `rest_excludes` hoists above
`$.with_script` templates; a prop default containing a nested arrow is treated as
non-simple (lazy thunk); reassigning state from a prop with a primitive default skips
the proxy flag. Analysis: `<svelte:window/document/body>` regular-attribute handler
expressions are now analyzed (so an imported call sets `needs_context`); snippets are
hoistable through `NewExpression` and `<svelte:component>`. Output is otherwise
unchanged; all gates green, no corpus regressions.
