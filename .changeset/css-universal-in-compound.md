---
"@rsvelte/compiler": patch
---

Keep a universal selector that is not a compound's last non-pseudo selector. Upstream's CSS transform walks a compound **backwards** and stops at the first non-pseudo selector it reaches: only there does `*` become the scoping class (`code.update(selector.start, selector.end, modifier)`), and anywhere else the walk never arrives. rsvelte replaced every `*` it met and then still appended the modifier after the compound's real subject, so `*.a` came out as `.svelte-X.a:where(.svelte-X)` where official emits `*.a.svelte-X`. `*` alone and `*:first-child` are unaffected — there the `*` *is* the stopping point, because a pseudo-class does not stop the backwards walk.
