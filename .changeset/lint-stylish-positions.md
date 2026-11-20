---
'@rsvelte/cli': patch
---

`rsvelte lint` prints the line and column `ESLint` prints for a file that starts with a byte order mark or uses `\r`, U+2028 or U+2029 line breaks. It prints a Svelte syntax error as `ESLint` does: the 0-based column and a `Parsing error: ` message with no rule.
