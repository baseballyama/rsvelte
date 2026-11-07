---
"@rsvelte/svelte-check": patch
---

fix(check): a SvelteKit kit file (`+page.ts`, `hooks.server.ts`, …) whose relative import leaves the workspace no longer reports a false `Cannot find module` (TS2307). Like upstream's `upsertKitFile`, such specifiers in import / export declarations, `import()`, `require()` and `import('…')` types are re-pointed from the overlay copy, and diagnostics later on the same line keep their column.
