---
"@rsvelte/vite-plugin-svelte": minor
---

feat: support Vite 8 and vendor the plugin into the rsvelte repo.

The `@rsvelte/vite-plugin-svelte` shim is now a first-class workspace package at `apps/npm/vite-plugin-svelte` (previously a git submodule pointing at the `baseballyama/vite-plugin-svelte` fork), so it versions and publishes through the normal changeset Release flow like every other `@rsvelte/*` package.

It also widens the `vite` peer range to `^6.3.0 || ^7.0.0 || ^8.0.0` so the plugin installs on Vite 8 (Rolldown) projects. No plugin-API changes were needed — the plugin already branches on `rolldownVersion`; this mirrors upstream's own Vite 8 support, which was likewise a peer bump. The "experimental" startup warning is now gated to pre-release Vite builds so stable Vite 8 users do not see it. Closes #815.
