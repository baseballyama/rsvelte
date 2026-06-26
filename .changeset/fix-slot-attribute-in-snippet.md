---
"@rsvelte/compiler": patch
---

fix(analyze): allow `slot="…"` on a direct child of a `{#snippet}` block

A `slot="name"` text attribute on an element whose immediate parent is a
`{#snippet}` body — e.g. `{#snippet active()}<span slot="active">…</span>{/snippet}` —
was wrongly rejected with `slot_attribute_invalid_placement`. Upstream's
`validate_slot_attribute` returns early when `context.path.at(-2)` is a
`SnippetBlock`. A new `is_direct_child_of_snippet` context flag (set while
analyzing a snippet body, reset on entering any nested element/block, mirroring
`is_direct_child_of_component`) reproduces that early return. Non-text `slot={…}`
values are still rejected by the separate `is_text_attribute` check.
