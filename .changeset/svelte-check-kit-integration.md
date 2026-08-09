---
'@rsvelte/svelte-check': patch
---

Follow a bare-package `extends` (`"extends": "$app/tsconfig"`, which SvelteKit writes into every app's `tsconfig.json`) when reading the project config. The base's `rootDirs`, `paths` and `types` were previously invisible, so the overlay restated `typeRoots` without them and `types: ["$app/types"]` became `TS2688` — one config-level error, which makes TypeScript suppress every semantic diagnostic program-wide and turns the whole run into a silent "0 errors". A config-level diagnostic (no file, no position) is now reported against the workspace instead of being dropped
