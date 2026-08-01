---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): route `<svelte:component>` children through the same slot
lowering a named component's children take. `handle_svelte_component` walked
its fragment with `process_fragment_inplace`, so a default-slot `let:` receiver
(`<div let:x>` / `<svelte:fragment let:x>`) never got its
`$$slot_def.default` destructuring prologue and every `let:` binding resolved
as an undeclared identifier in the generated TSX; a `<svelte:fragment
slot="a">` child likewise kept a plain `"slot":\`a\`,` attribute instead of the
`$$slot_def["a"]` wrapper. Official svelte2tsx treats `svelte:component` as an
`InlineComponent`, so slot content forwards the same way there.
