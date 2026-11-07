---
"@rsvelte/svelte-check": patch
---

fix(check): a run without `--incremental` now clears the previous run's shadows and SvelteKit mirrors from `.svelte-check` before emitting, so a component or route deleted since no longer fails the check. Symlinks inside the cache are removed, never followed. Two runs on the same workspace (e.g. `--watch` beside a one-off check) now take turns on the cache instead of one clearing files the other is still type-checking.
