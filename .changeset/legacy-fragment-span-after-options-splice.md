---
'@rsvelte/compiler': patch
---

fix(parse): the legacy `html` fragment's span is read after `svelte:options` is spliced back

Upstream's `convert_to_legacy` splices the extracted `<svelte:options>` node back
into `fragment.nodes` and only then reads `first.start` / `last.end`. rsvelte
computed the span from the pre-splice vector while building `children` from the
post-splice one, so a component whose first or last node is `<svelte:options>`
reported a fragment starting after it — and a component holding nothing else
reported `start`/`end` of `null` beside a `children` array of length 1.
