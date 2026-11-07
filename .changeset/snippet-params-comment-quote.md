---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/language-server": patch
"@rsvelte/svelte-check": patch
---

fix(parser): a snippet's parameter list is delimited by counting parentheses only, as upstream does. The scan also skipped `'`/`"` strings, so an apostrophe in a comment inside the parameter types (`// it's …`) opened a string that ran to the end of the file and failed the component with `Expected token )`.

A header whose parenthesis count stops inside a string, template, regex or comment is now a `js_parse_error` at upstream's position in TypeScript components too, rather than `Expected token }`. Type parameters are read with upstream's bracket matcher: whitespace is allowed before `<`, backtick strings are skipped, an unterminated quote is `unterminated_string_constant`, and `typeParams` keeps its inner whitespace.
