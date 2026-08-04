---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): drop the trailing space after `<svelte:self>`'s generated
`$on(...)` calls. `handle_svelte_self` reimplemented event-call emission
with a bespoke loop that appended `'); '` instead of `');'`, diverging from
official's `InlineComponent.addEvent` and from rsvelte's own
`handle_component`, which already reuses the shared `build_on_calls` helper.
`handle_svelte_self` now calls the same helper.
