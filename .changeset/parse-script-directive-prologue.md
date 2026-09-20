---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

parse(): a `<script>` directive prologue is an `ExpressionStatement` carrying `directive`

OXC lifts a directive prologue out of `Program::body` into `Program::directives`; ESTree
keeps those statements in `body` with an extra `directive` field. The script-program
converter read only `body`, so `"use strict"` at the top of a `<script>` disappeared from
`parse()`'s AST.
