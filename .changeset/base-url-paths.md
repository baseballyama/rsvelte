---
"@rsvelte/language-server": patch
---

fix(lsp): a `baseUrl`-rooted import keeps its type

tsgo (TypeScript 7) has removed `baseUrl`; TypeScript 5.x, which `svelte-language-server` runs,
still honours it, so every non-relative import a project roots at `baseUrl` lost its type here
and kept it there — hover returned `null` and a `2307` appeared where official reported nothing.
The overlay now writes tsgo's own prescribed replacement, `"paths": {"*": ["<baseUrl>/*"]}`, plus
the shadow-tree twin, unless the project maps `*` itself.
