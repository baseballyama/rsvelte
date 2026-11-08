---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Stop reporting `state_referenced_locally` for a template `{const}` / `{let}` that reads `$state`, `$derived` or props from the component's `<script>`, as the official compiler does. The warning now fires, with the same `closure` / `derived` wording, only for a declaration-tag binding of the same block read synchronously.
