---
"@rsvelte/compiler": patch
---

fix(compiler): deep-read a keyed `{#each}` block's reactive index in dependency lists

In a keyed each block (`{#each items as item, i (item.key)}`) the index `i` is
reactive — upstream gives it binding kind `template`, so a dependency read deep-reads
it: `$.deep_read_state($.get(i))`. rsvelte emitted a plain `$.get(i)` because the
each-block visitor unconditionally cleared the index from `transform_deep_read`, and
the `EachIndex` fallback check in `collect_reactive_references` can miss it when
`get_binding` resolves a same-named non-index binding (e.g. a `map((d, i) => …)`
callback param) instead of the keyed index.

The index is now marked in `transform_deep_read` when reactive (keyed), and still
shadows an outer same-named marker when static (non-keyed).

Clears `layerchart/.../charts/AreaChart.svelte`, zero corpus regressions.
