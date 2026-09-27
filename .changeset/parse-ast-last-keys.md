---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/language-server": patch
---

fix(parser): `parse()` keeps a `ParenthesizedExpression` written inside a snippet parameter, as `svelte/compiler` does. A `loose` parse gives `end: -1` to every node left open except the innermost, as upstream does. An unclosed `{:else if}` is now the block reported as left open.
