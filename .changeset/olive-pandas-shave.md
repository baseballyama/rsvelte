---
'@rsvelte/compiler': patch
---

Stop the SSR constant fold from resolving a template binding to a same-named instance binding. An `{#await … then n}` value, an `{#each … as _, n}` index used directly as the loop variable, and every each-block binding read inside the `{:else}` fallback were missing from the fold's shadow set, so `{n}` rendered the outer value as a frozen literal.
