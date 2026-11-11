# `legacy-prop-member-title.svelte`

**Issue:** corpus residue

A multiline legacy `<title>` expression that reads through an `export let` prop must establish a `$.deep_read_state(prop)` dependency before evaluating the member chain under `$.untrack`. Upstream classifies legacy props as `bindable_prop`; rsvelte's distinct ordinary `Prop` kind must receive the same scoped deep-read marker.
