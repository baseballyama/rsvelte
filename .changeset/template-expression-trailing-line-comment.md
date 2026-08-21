---
'@rsvelte/compiler': patch
---

Accept a `//` comment whose newline is the last thing before a template expression's own terminator (`<p>{1 // c⏎}</p>`, `<div class={a ? "x" : "y" // c⏎}>`). rsvelte re-parses the expression text wrapped in parentheses, and the caller's whitespace-trim had deleted the newline that terminated the comment, so the synthetic `)` landed inside it
