---
'@rsvelte/svelte-check': patch
---

Follow the array form of tsconfig `extends` (TS 5.0+). A config extending several parents — the shape SvelteKit and WXT force on a project that also wants a shared base, `["../tsconfig.base.json", "./.svelte-kit/tsconfig.json"]` — had its whole `extends` graph skipped, so the generated config's `include` and `paths` never reached the overlay and its ambient modules (`$env/dynamic/public`, `./$types`) were reported as TS2307. Entries are now searched right to left, later ones winning, matching `tsc`.
