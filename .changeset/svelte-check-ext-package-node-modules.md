---
"@rsvelte/svelte-check": patch
---

svelte-check: resolve an external package's `.svelte` shadow imports from the
package's own `node_modules`.

A monorepo sibling's `.svelte` shadows are emitted under `<cache>/ext/<n>/`.
Their bare-package imports (`import type { SortableOptions } from 'sortablejs'`,
including the matching `@types/*` declarations) were resolved by walking up to
the *workspace* `node_modules`, missing any dependency present only in the
external package's own tree — the imported type silently became `any`, which
poisoned `ComponentProps<typeof Foo>` in every consumer (callback props turned
into spurious implicit-any).

The shadow dir now symlinks `<mirror>/node_modules` → `<real-pkg>/node_modules`,
so bare imports resolve from the same context as in-place checking — no
specifier rewriting, `@types` resolution intact. On a large SvelteKit app this
cleared the cross-package `ComponentProps` cluster (25 → 10 reported errors).
