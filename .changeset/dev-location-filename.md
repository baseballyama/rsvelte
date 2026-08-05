---
"@rsvelte/compiler": patch
---

Use the whole `rootDir`-relative filename in dev-mode location strings. `ComponentAnalysis::filename` held only the basename, so `$inspect.trace()` labels and `$.assign()` locations reported `main.svelte` where the official compiler reports the full path (with `/` sanitized to `/​`).
