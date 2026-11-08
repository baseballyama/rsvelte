---
"@rsvelte/lint": patch
"@rsvelte/language-server": patch
---

feat(lint): track eslint-plugin-svelte 3.24.1. `svelte/no-export-load-in-svelte-module-in-kit-pages` and `svelte/prefer-destructured-store-props` recognize `<script module>` as a module script; the `svelte/prefer-derived-over-derived-by` autofix keeps parentheses, comments and the return type (as `$derived<T>(…)`), wraps a bare sequence expression, and is withheld when it would drop a comment or change what `this` / `arguments` / the function's own name refer to; `svelte/require-event-prefix` reports only function props whose annotated return type produces no value (`void` / `undefined` / `null`, or a `Promise` of one with `checkAsyncFunctions`).
