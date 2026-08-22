---
"@rsvelte/compiler": patch
---

Accept a template expression whose last token is a `//` line comment. `{#if flag // why⏎}` — and the same shape in `{#key}`, an expression tag, an attribute value, `{@html}` and `{@render}` — was rejected with `js_parse_error`, and five more hosts (`{@const}`, its destructuring form, the `{#await}` head, snippet parameters, a call's argument list) swallowed the failure into an empty identifier and emitted wrong code. The closing `}` was located correctly; every parse then wrapped the slice as `(<slice>)` — or `let <slice> = null` / `(<slice>) => {}` — with the synthetic suffix on the comment's own line, so the comment ate it. The suffix now goes on the next line, which leaves every offset inside the slice unchanged and keeps an arrow's `)` adjacent to its `=>`.
