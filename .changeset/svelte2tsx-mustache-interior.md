---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A mustache in an attribute value now contributes the text between its braces, not the
span of the expression node inside them.

Official copies the interior verbatim into the template literal it builds, so
`class="x {// why⏎a} z"` keeps the comment and `class="x { a } z"` keeps its two
spaces; rsvelte emitted `${a}` for both. The interior reaches a template literal
through two builders — the string one used by `<slot>` and named-slot-element
attributes, and the segment one used by elements, `style` and component props — and
both had the expression's span.
