---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

chore(svelte2tsx): shrink module-wide lint allows and fix doc attribution

Remove the blanket `#[allow(dead_code, doc_lazy_continuation,
if_same_then_else, unnecessary_unwrap, ...)]` module attributes on the
svelte2tsx submodules — only `module_inception` remains (with its own
reason), since `svelte2tsx::svelte2tsx` mirrors the upstream package
layout. Truly dead helpers are deleted (unused JSON rune-global walkers,
`node_start_pos`/`node_end_pos`, unused structured-bake formatters, unused
`PropsRuneInfo` fields), `is_some()`-then-`unwrap()` sites become
let-chains, identical `if`/`else` arms collapse, and doc comments that had
drifted onto the wrong item (`process_instance_script`,
`handle_reactive_statement`, `emit_segmented_overwrite`,
`format_attribute_node_segments`, overlay's `emit_external_shadows` /
`path_relative`) are reattached. No behavior change — the transform output
is byte-identical (fixture suite verified).
