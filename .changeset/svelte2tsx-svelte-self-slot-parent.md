---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): lower slots for `<svelte:self>` as a slot parent. Official
svelte2tsx models `<svelte:self>` as an `InlineComponent`, so its children are
slot consumers of that node, but rsvelte performed no lowering there at all:
`<svelte:self><div slot="a">` kept a bogus `"slot":`a`` prop instead of the
`$$slot_def["a"]` wrapper, `<svelte:self><div let:x>` kept a bogus
`"let:x":true` prop instead of the `$$slot_def.default` destructure (leaving
every `let:` binding an undeclared identifier), and the `$$_svelteselfN`
instance const was never declared. Named-slot children reached through
`{#if}` / `{#each}` / `{#await}` / `{#key}` now forward too, and a
`<svelte:self>` that is itself a named-slot child keeps both levels of
wrapper.
