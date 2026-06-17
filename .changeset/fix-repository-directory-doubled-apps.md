---
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/svelte-check": patch
"@rsvelte/svelte2tsx": patch
---

Fix the doubled `apps/apps/npm/...` path in the published `repository.directory`
metadata. The correct location is `apps/npm/<pkg>`, so the "source" link on
each package's npm page now resolves instead of 404ing. This corrects the
remaining packages missed when `@rsvelte/svelte-check` was fixed in #977: the
`svelte-check-*` and `vite-plugin-svelte-native*` prebuilt-binary packages and
`@rsvelte/svelte2tsx`. The `fixed` changeset groups carry the patch bump to
every native sub-package.
