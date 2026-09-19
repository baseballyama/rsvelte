---
"@rsvelte/language-server": patch
"@rsvelte/svelte-check": patch
---

The generated overlay cache directories now ignore themselves. `.rsvelte-language-server/` (written by the language server into every workspace folder it is opened against) and `.svelte-check/` (written by `rsvelte-check`) each get a `.gitignore` holding `*` when they are created, so neither shows up as an untracked directory in `git status`. Previously, using the editor integration alone left a directory in the repository that nothing had ever added an ignore entry for.
