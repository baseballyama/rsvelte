---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): stop leaking an imported library's internal diagnostics into a consumer's `--tsgo` run. When a project imports a workspace component library, its `.svelte` components are shadowed under `<cache>/ext/<n>/` so cross-package named exports resolve (#782). Those shadows were also type-checked, so the library's own transitive deps (`Cannot find module '@floating-ui/dom'`, `sortablejs`, `@nexus/types`) and every internal bug surfaced as errors on the consumer — official svelte-check reports 0 because it never type-checks a node_modules `.svelte` as a reported document. `map_tsgo_diagnostics` now drops any diagnostic whose file lives under the `<cache>/ext/` shadow root, matching official behavior while keeping the shadows for #782 export resolution. Closes #941.
