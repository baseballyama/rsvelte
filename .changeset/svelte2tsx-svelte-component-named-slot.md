---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): wrap a `<svelte:component>` / `<svelte:self>` named-slot
child (`<svelte:component this={Inner} slot="a" />`) in the parent's
`$$slot_def["a"]` block. `has_named_slot_children` (and the parallel
`is_named_slot` check in `process_component_children_with_slots`) never
matched `SvelteComponent` / `SvelteSelf` nodes, so such a child fell through
to the plain fragment walk instead of the named-slot lowering — unlike
official svelte2tsx, which models both as `InlineComponent` and forwards them
exactly like a named `<Component slot="a">` child. Found while fixing #2103
(PR #2135).
