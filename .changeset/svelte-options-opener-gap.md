---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Route `<svelte:options>`'s opener gap through the shared `opener_spacing` helper so the generated TSX matches official svelte2tsx exactly, including bare boolean attributes like `<svelte:options runes />`.
