---
"@rsvelte/vite-plugin-svelte-native": patch
---

chore(vite-plugin-svelte-native): report Svelte `5.56.8` from the `VERSION` export

The hardcoded `VERSION` export is what consumers feature-detect against
(`gte(VERSION, '5.36.0')`), so it has to track the Svelte version rsvelte is
compiled against — now 5.56.8.
