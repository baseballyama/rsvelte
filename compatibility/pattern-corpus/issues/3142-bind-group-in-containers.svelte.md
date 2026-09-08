# `3142-bind-group-in-containers.svelte`

**Issue:** [#3142](https://github.com/baseballyama/rsvelte/issues/3142)

A `bind:group` under `<svelte:boundary>` or `<svelte:fragment>` produced a `$.bind_group(...)` call against an array that was never declared. The file uses two distinct groups so the numbering (`binding_group`, `binding_group_1`) is exercised, and puts one inside a boundary snippet — a fragment reached through a second container, not just the first
