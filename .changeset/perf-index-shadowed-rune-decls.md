---
'@rsvelte/compiler': patch
---

Index shadowed-rune declarations once per client transform instead of running twelve full-script substring searches per reactive binding. Rune-heavy components were paying O(binding count × script length) here: a component with 40 `$derived` declarations now compiles 50% faster, real-world Svelte files up to 23% faster, and the flowbite-svelte corpus 6.9% faster overall.
