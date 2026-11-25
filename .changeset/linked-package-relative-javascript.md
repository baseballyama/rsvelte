---
'@rsvelte/cli': patch
---

`typecheck` no longer reports TS7016 when `allowJs` is on for a component without `<script>` that a linked package's own files import by a relative path. TypeScript loads such a component, as svelte-check does, even though the search of `node_modules` found the package.
