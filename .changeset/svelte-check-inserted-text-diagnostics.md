---
'@rsvelte/svelte-check': patch
---

Drop a diagnostic that lands entirely inside text svelte2tsx inserted. Inserted text carries no source-map segments, so a greatest-lower-bound lookup silently answered with the segment before the gap — which pinned an error about the SvelteKit `$types` annotation svelte2tsx injects onto the author's `export let form`, on a route whose `$types` never declared that member. Official svelte-check discards such a diagnostic because MagicString leaves a source-less segment there and `originalPositionFor` returns null; rsvelte's map has no such segment, so the gap is now identified by its ends instead — an insertion consumed nothing, so the segments on either side point at the same source position, whereas a rewritten chunk is bounded by its source start and its source end and keeps mapping to the chunk anchor
