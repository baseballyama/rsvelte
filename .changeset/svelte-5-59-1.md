---
'@rsvelte/cli': patch
---

Follow Svelte 5.59.1. The client output imports `svelte/internal/init-operations`, which Svelte 5.59 needs to mount a component. The server output renders `<title>` after the rest of `<svelte:head>`. It also drops the comments inside removed `$effect` and `$inspect.trace` statements.
