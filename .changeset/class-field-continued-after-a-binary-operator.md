---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Keep a class field whole in server output when its initializer breaks across lines after `=` or at a binary or logical operator (for example a bit-flag union formatted one operand per line) in a class that also has a `$state` / `$derived` field. The output used to split it into one statement per line, which is not valid JavaScript.
