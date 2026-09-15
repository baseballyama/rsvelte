---
"@rsvelte/language-server": patch
"@rsvelte/svelte-check": patch
---

fix(lsp): a project with no `node_modules` types against the `svelte` beside the server

`svelte-language-server` resolves `svelte` with `paths = [the document's workspace, __dirname]`,
so it degrades to the copy shipped next to itself. rsvelte only looked in the workspace, so an
un-installed project lost every `svelte/*` type — hover returned `null` — and gained a
`2307 Cannot find module 'svelte/transition'` official does not report. The overlay now declares
the fallback package's ambient modules when, and only when, the workspace cannot resolve one.
