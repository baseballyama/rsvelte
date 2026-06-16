---
---

Internal: complete the type-aware `svelte/no-unused-props` port — a faithful
recursive `checkUnusedProperties` walk over a new on-demand type-graph backend
API (`TypeBackend::{props_type, type_meta, type_props}`) covering
`checkImportedTypes` (per-property declaration origin), `ignorePropertyPatterns`
/ `ignoreTypePatterns` (exact `toRegExp` semantics), `allowUnusedNestedProperties`,
nested recursion into named/imported types, `isClassType` skipping, and the
unused-index-signature message. All 76 upstream fixtures pass via the corsa/tsgo
e2e oracle. No published package is affected (`rsvelte_lint` is not released), so
this changeset bumps nothing.
