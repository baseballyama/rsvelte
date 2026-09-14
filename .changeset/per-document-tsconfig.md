---
"@rsvelte/language-server": patch
---

fix(lsp): a subdirectory's own tsconfig applies to the documents beneath it

The tsgo overlay built one project from the workspace root's config, while
`svelte-language-server` resolves a project **per document** — the nearest ancestor
`tsconfig.json` / `jsconfig.json`. In any repository whose subdirectories carry their own config,
every option those configs declare was invisible: a `paths` alias one level down produced a
`null` hover and a `2307`, with the relative import beside it still resolving. Projects are now
built on demand, keyed by the config that owns the document.
