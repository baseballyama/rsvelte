---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): re-release to pick up post-0.3.7 svelte2tsx overlay fixes

`@rsvelte/svelte-check` builds the TSX overlay it type-checks by calling the
same `rsvelte_core` svelte2tsx code that ships in `@rsvelte/svelte2tsx`, but it
is a self-contained native binary with no npm dependency edge to
`@rsvelte/svelte2tsx` (or `@rsvelte/compiler`). Because of that, changesets
never cascades a core/svelte2tsx change into svelte-check — it only bumps when a
changeset names it explicitly.

`@rsvelte/svelte-check@0.3.7` was cut on 2026-06-26, *before* several svelte2tsx
overlay fixes landed, and those fixes were only released through
`@rsvelte/svelte2tsx@0.1.20` (2026-07-03) — svelte-check was left stale. This
re-release rebuilds the binary against the current core so svelte-check's
type-checking diagnostics reflect the same overlay as the standalone tool.
Included behaviors that were missing from 0.3.7:

- carry a renamed-export's JSDoc onto the prop (#1230)
- widen a renamed legacy prop with a typed default via `__sveltets_2_any` (#1231)
- bind a component child's legacy `let:` from its own `$$slot_def` (#1232)
- drive svelte2tsx corpus output-parity to zero — 254 → 0 (#1295)
