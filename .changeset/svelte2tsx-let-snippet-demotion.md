---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

An inline component's direct `{#snippet}` child is now demoted to a component
prop even when the component also carries a `let:` directive or has other
named-slot children, matching official svelte2tsx. rsvelte previously gated
the snippet-to-prop relocation off whenever `let:` (or a named-slot child) was
present and fell back to emitting the snippet as a standalone block-scoped
`const foo = …` declaration instead — official always demotes the snippet and
independently emits the `let:` / named-slot `$$slot_def` destructure alongside
it. Applies to named components, `<svelte:component>`, and `<svelte:self>`.
