---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Keep a statement whole when a component with a top-level `await` (`experimental.async`) is split into its async body. A line ending in `=>` or another operator (including after a trailing comment, or a string that contains `//`), a keyword such as `typeof`, `await` or `else`, or the header of a brace-less `if`/`for`/`while`, no longer ends the statement when the next line starts with a `$.` call or a statement keyword; the output used to be unparseable or, after a `// comment`, silently different. An `async` arrow function declared after the first `await` is now hoisted like any other arrow function, as upstream does.
