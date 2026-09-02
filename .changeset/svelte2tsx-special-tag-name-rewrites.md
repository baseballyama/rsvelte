---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

`<svelte:body>`, `<svelte:window>`, `<svelte:document>`, `<svelte:head>` and
`<svelte:fragment>` no longer fold an attribute name's case or rewrite a
number-only value.

Both rewrites need `element instanceof Element && parent.type === 'Element'`, and
every one of those tags is an `Element` whose node type is not `Element` — only
`<svelte:element>` carries that type. So `<svelte:window someProp="0" cols="3" />`
keeps `someProp` and types `cols` as a string, where rsvelte emitted `someprop`
and `3`. The `data-` wrapper needs only the first condition and is unchanged.
