---
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix: port Svelte 5.55.9 follow-ups — `nullish-coallescence-omittance` SSR
stringify omittance (upstream `a5df6616e`) and `Percentage` keyframe
double-print (upstream `ca3f35bf7`). Class / style / innerHTML SSR paths
and the head-element SSR / `css-keyframes-percent` print path are still
tracked as follow-ups in the per-suite skip lists.
