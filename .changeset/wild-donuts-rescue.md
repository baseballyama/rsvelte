---
"@rsvelte/svelte-check": patch
---

Fix `--tsgo`/`svelte-check` false "has no exported member" / "has no default export" diagnostics for a `.svelte` import resolved through a `tsconfig.json` `compilerOptions.paths` alias (e.g. SvelteKit's `kit.alias`) into a sibling workspace package with no `node_modules` entry at all. `discover_external_svelte_packages` previously only found sibling packages reachable via a `node_modules` symlink (#782/#805); it now also resolves `paths` alias targets that land outside the workspace and mirrors those too.

Also fixes a related bug this surfaced: with a relative `--tsconfig` path (the CLI's own documented usage, `--tsconfig ./tsconfig.json`), `oxc_resolver`'s tsconfig discovery silently returned `NotFound` for any `paths` target that resolves outside the current working directory via `..` — exactly what every cross-package alias does. `build_svelte_import_resolver` now absolutises the tsconfig path before handing it to `oxc_resolver`.

Alias targets follow TypeScript's own rules — resolved against `baseUrl` when
one is set (including one inherited through `extends`), else against the
directory of the config that declared `paths`. A target that does not exist is
skipped rather than widened to its parent directory, and one that names a
directory *containing* the workspace (`"@/*": ["../../*"]` in a monorepo) is
never mirrored: the workspace's own files are already covered and the walk
would cover the whole repository.
