---
"@rsvelte/compiler": patch
---

Stop deoptimizing every structural CSS prune when the component contains a `<svelte:element>`. The compound, descendant-chain and nested-ancestor walkers each bailed out for the whole component as soon as one dynamic element existed, so `.a.b` was kept when `.a` and `.b` sat on different elements and `.p .q` was kept with no `.p` ancestor anywhere. Upstream exempts a dynamic element from the type-selector test only, which the per-element matcher already does.
