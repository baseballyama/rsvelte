---
"@rsvelte/svelte-check": patch
---

Fix `ComponentProps<typeof X>['prop']` losing its callback's parameter types
when `X` is a component reached through a self-referential `paths`/bundler
alias *inside its own external (workspace-sibling) package* — a common
monorepo pattern where a design-system package imports its own components
through the same public alias its consumers use, not a relative path.

`emit_external_shadows` (which materialises shadows for a sibling package
discovered via a `node_modules` symlink) never rewrote aliased `.svelte`
imports inside the shadows it emits, so a component's own such import fell
back to the ambient `*.svelte` wildcard (default export only) in its shadow —
poisoning `ComponentProps<...>` for every consumer. `rewrite_aliased_svelte_imports`
now also matches specifiers resolving under an external package's own real
dir (not just the workspace), and `emit_external_shadows` runs it too.

Also anchor a relative `--tsconfig` path on the CWD before building the
alias-resolution `Resolver` — otherwise oxc_resolver's tsconfig discovery
silently returns `NotFound` for any `paths` target escaping the CWD via `..`,
which is exactly the cross-package aliases this fix (and `--tsconfig
./tsconfig.json`, the CLI's own documented usage) depends on.

An external package's aliases are resolved with that package's own tsconfig
when it ships one, and a specifier that resolves outside the package being
emitted keeps its original form — `$lib` is SvelteKit's own convention, so a
consumer and a package routinely both define it, and resolving the package's
own import with the consumer's `paths` would silently swap in an unrelated
component.

Fixes #1887.
