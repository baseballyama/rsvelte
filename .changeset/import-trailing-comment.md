---
"@rsvelte/compiler": patch
---

fix(client): end a semicolon-free `import` at its module specifier when a comment follows it. `import x from "m" // c` merged the next line into the import statement, so the emitted module did not parse and the swallowed declaration was missing from the component function.
