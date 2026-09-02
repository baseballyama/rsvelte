---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

An element that targets a named slot with a `slot` attribute now lowers its `bind:`
directives like any other element.

That element is handled by a second port of the element transform, which built its own
attribute object and its own class/style + transition suffix and never ran the binding
pass — so `bind:this` stayed a `"bind:this": element` prop instead of becoming
`const $$_button1 = svelteHTML.createElement(…); … element = $$_button1;`, a two-way
binding lost its `() => v = __sveltets_2_any(null)` setter, and a void or self-closing
element closed with a leading space that only an overwritten `</tag>` produces.
`<svelte:element>` and the special elements share that attribute builder and emit the
suffix themselves, so they lower the same bindings now too.
