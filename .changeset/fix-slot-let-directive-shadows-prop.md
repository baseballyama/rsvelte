---
"@rsvelte/compiler": patch
---

fix(transform): a `let:` slot binding shadows a same-named prop

`<tbody slot="data" let:data>` on a slotted element provides that slot's own
`data` scope, which must shadow an outer `let { data } = $props()` prop inside
the element's subtree. The client registered the let: `$.get(data)` read
transform, but `convert_expression` still rewrote the bare `data` to
`$$props.data` before the transform could apply (props are resolved up front and
only skipped for names in `shadowed_prop_names`), so references inside the slot
read the outer prop instead of the slot binding. `process_element_let_directives`
now adds each let: name to `shadowed_prop_names` for the element's subtree
(restored afterward), mirroring the each-item / snippet-param handling, so
`{#each data ?? []}` / `{@const … = data}` inside the slot read `$.get(data)`.
