---
"@rsvelte/svelte-check": patch
---

svelte-check: scope reported diagnostics to the checked workspace, matching
official svelte-check, eliminating two classes of false positives.

- **Cross-package source files.** In a monorepo a sibling package pulled in
  transitively (e.g. `packages/design-system/...` resolved through a workspace
  symlink) is that package's own concern — official svelte-check only reports
  the invoked workspace's documents. rsvelte was surfacing the sibling's
  internal diagnostics (such as a `Foo.svelte` + `Foo.svelte.ts` companion's
  no-default-export edge) in every consumer's report. Diagnostics whose file
  lives outside the workspace root are now dropped; use-site errors in the
  workspace are unaffected.

- **Raw SvelteKit route files.** A `+layout.ts` / `+page.ts` is a program root
  and was type-checked WITHOUT rsvelte's kit injection (which wraps `load` in
  `(…) satisfies …Load` so its destructured event is typed), producing false
  `implicit-any` on un-annotated `load` params. The injected mirror under
  `<cache>/svelte/…` is the authoritative version, so the raw source route
  file's pre-injection diagnostics are now dropped.

It also always pairs the workspace source root with the `<cache>/svelte` shadow
mirror in `rootDirs` (previously the fallback, used when a project declares no
`rootDirs` of its own, omitted it). Without the pairing a plain `.ts` /
`.svelte.ts` source file importing `./Foo.svelte` resolved to nothing (`any`),
silently degrading `ComponentProps<typeof Foo>` to `any`.

Together with the alias-import resolution fix, this takes a large SvelteKit app
from 140 reported errors to 25 (the remainder are deeper cross-package
ext-mirror `ComponentProps` typing and discriminated-union narrowing
divergences).
