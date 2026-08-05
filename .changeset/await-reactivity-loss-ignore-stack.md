---
"@rsvelte/compiler": patch
---

fix(compiler): honour analysis-phase `svelte-ignore` for await instrumentation.
The dev-mode `$.track_reactivity_loss` rewrite recognised
`svelte-ignore await_reactivity_loss` by scanning the lines above the `await`,
so it missed every form upstream honours through the analysis-phase ignore
stack: a comment on an enclosing node, a comment on a multi-line statement whose
`await` lands on a later line, and a same-line block comment. The suppression is
now computed the way upstream's acorn comment attachment plus `ignore_map` does
— a leading comment binds to the outermost node that starts after it and the
whole subtree of that node inherits the ignore.
