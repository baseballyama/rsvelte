---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/language-server": patch
"@rsvelte/svelte-check": patch
---

fix(parser): a snippet's parameter list is delimited by counting parentheses only, as upstream does. The scan also skipped `'`/`"` strings, so an apostrophe in a comment inside the parameter types (`// it's …`) opened a string that ran to the end of the file and failed the component with `Expected token )`.
