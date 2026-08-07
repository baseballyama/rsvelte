---
"@rsvelte/compiler": patch
---

fix(compiler): read legacy SSR bracket scanners lexically

The `export let` / reactive `$:` line scanners in the server transform counted
brackets, commas, semicolons and `=` without skipping comments, so a delimiter
inside a `//` or `/* */` comment moved the depth counter — splitting a `$:` block
at a `}` that lived in a comment, or truncating a declarator at a commented-out
`;`. They now walk only the code bytes.
