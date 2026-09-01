---
'@rsvelte/compiler': patch
---

A `class:` directive whose value is the identifier of the same name now reaches `$.attributes`
untransformed on the server, matching the official compiler. Upstream's `prepare_element_spread`
skips the read transform for that shape, so a `$derived` is passed as the derived function —
always truthy — and SSR renders the class unconditionally; rsvelte called it. The condition is on
the expression rather than the syntax, so `class:active={active}` is affected identically, while
an element with no spread goes through `build_attr_class`, which has no such arm and still
transforms. Recorded in
`upstream_issues/4117-svelte-class-shorthand-reaches-attributes-untransformed.md`.
