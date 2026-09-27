---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/language-server": patch
---

fix(parser): when a component contains a bare `\r`, ` ` or ` `, `parse()` numbers JavaScript `loc` lines the way acorn does. Upstream only hands acorn a `\n`-based start location when the template breaks lines on `\n` alone; otherwise acorn counts every ECMAScript line terminator itself (lines before a template expression are counted up to its last `\n`, script-prefix characters are blanked to spaces). rsvelte always used the `\n` locator, so every `loc` after such a character was off by the number of terminators it skipped.
