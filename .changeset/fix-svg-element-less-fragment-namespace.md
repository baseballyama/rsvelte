---
"@rsvelte/compiler": patch
---

fix(compiler): infer SVG namespace for element-less fragments inside `<svg>`

A `{#snippet}` (or any element-less fragment) whose body lives in an SVG context
but contains only adjacent component / render-tag anchors was emitted via
`$.from_html` instead of `$.from_svg`, and the SSR markup kept a spurious
whitespace text node between the anchors (`<!----> ` instead of `<!---->`). This
cascaded into wrong `$.sibling(node, 2)` offsets. Namespace inference for a
fragment with no element children now inherits the enclosing namespace (a
faithful port of upstream `check_nodes_for_namespace`, deep-walking
`{#if}` / `{#each}` / `{#await}` / `{#key}` containers) rather than defaulting to
`html`, on both the client and server transforms.
