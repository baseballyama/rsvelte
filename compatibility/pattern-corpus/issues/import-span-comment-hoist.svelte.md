# `import-span-comment-hoist.svelte`

**Issue:** mutation ratchet + 2 corpus files

A comment inside an `import` declaration's own span is carried out with the hoisted import on the client, and the module-scope printer never emits it — so it vanishes. Upstream removes the declaration node and esrap flushes the comment onto the next located statement inside the component function, at that import's own position (a comment in an import that FOLLOWS a statement lands after it, so collecting them all at the top is wrong). The boundary is what names the span rather than imports generally: leading, trailing and between-import comments are already routed to the body by the line scan and always matched. Server was correct throughout — one more two-ports divergence. Reached unmutated by `layercake/.../MapLabels.html.svelte` and `svelte-lexical/demos/playground/src/ToolbarPlayground.svelte`.
