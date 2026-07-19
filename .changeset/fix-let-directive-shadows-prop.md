---
"@rsvelte/compiler": patch
---

fix(transform): a `let:` directive shadows an outer same-named prop

A `let:` directive on a slotted element (e.g. `<tbody slot="data" let:data>`)
registers a `$.get(data)` read transform for the derived slot binding, but
`convert_identifier` resolves a `Prop`/`BindableProp` binding straight to
`$$props.name` unless the name is in `shadowed_prop_names` — so when the `let:`
name collided with an outer `let { data } = $props()` prop, reads inside the
slot body wrongly emitted `$$props.data` instead of `$.get(data)`.

`process_element_let_directives` now adds each `let:` binding name to
`shadowed_prop_names` for the duration of the element's children (restored
afterwards), mirroring the each-item / snippet-parameter shadowing already done
in `each_block.rs` / `snippet_block.rs`.
