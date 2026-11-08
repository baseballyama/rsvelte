---
"@rsvelte/lint": patch
"@rsvelte/language-server": patch
---

fix(lint): honour the SvelteKit major that eslint-plugin-svelte gates rules on. `svelte/no-goto-without-base` and `svelte/no-navigation-without-base` no longer run in a SvelteKit 3 project (upstream limits them to SvelteKit 1 and 2), and `svelte/no-navigation-without-resolve` no longer runs past SvelteKit 3. The version is read the way upstream reads it: the installed `node_modules/@sveltejs/kit` version first, else the first parseable `@sveltejs/kit` range declared in a `package.json` up the file's directory chain.
