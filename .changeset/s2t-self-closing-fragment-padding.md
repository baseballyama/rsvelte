---
"@rsvelte/svelte2tsx": patch
---

Match upstream's column padding for a self-closing `<svelte:fragment slot="x" />` in a component: the space the `/` occupies belongs inside the emitted `{}`, not after the call. The remaining attribute-count variants are #3104.
