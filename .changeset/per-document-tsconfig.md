---
"@rsvelte/language-server": patch
---

fix(lsp): a subdirectory's own tsconfig applies to the documents beneath it

The tsgo overlay built one project from the workspace root's config, while
`svelte-language-server` resolves a project **per document** — the nearest ancestor
`tsconfig.json` / `jsconfig.json`. In any repository whose subdirectories carry their own config,
every option those configs declare was invisible: a `paths` alias one level down produced a
`null` hover and a `2307`, with the relative import beside it still resolving. Each config that owns
a component is now a project of its own, built before tsgo starts so the order documents open in
cannot change another project's answers; one that appears later is built when its first document
opens.

A nested project's shadow tree mirrors the enclosing workspace and lives in that workspace's
`.rsvelte-language-server/`, so a relative import of a `.svelte` file outside the project
directory (`../shared.svelte`) still resolves; the files it reaches that way are shadowed too.

Type diagnostics on a component without `lang="ts"` now carry `source: "js"`, as
`DiagnosticsProvider` labels them by script kind; tsgo always says `ts`.
