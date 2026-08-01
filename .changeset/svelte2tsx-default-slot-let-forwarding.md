---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): forward a component's default-slot `let:` from every node kind
official models as an `Element`, and through control-flow blocks. The wrapping
only covered a direct `RegularElement` / `<svelte:fragment>` child, so
`<Foo><svelte:element let:x>`, `<Foo><slot let:x>` and any `{#if}` / `{#each}` /
`{#await}` / `{#key}`-nested `<div let:x>` dropped their `$$slot_def.default`
prologue and emitted a bogus `"let:x": true` attribute, leaving every `let:`
binding an undeclared identifier in the generated TSX. A component-direct
`<style let:x>` no longer leaves an orphaned `$$slot_def` block behind (official
deletes the whole `<style>` range, block included) nor steals one space from the
next sibling's indent. `<svelte:fragment>` / `<svelte:boundary>` also stop
leaking their enclosing component's slot scope into their own children, and a
block-nested one with a static `slot="name"` now gets the `$$slot_def["name"]`
wrapper instead of a plain `slot` attribute.
