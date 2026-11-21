---
'@rsvelte/cli': patch
---

The compiler now reports a keyword used as a name, or written with an escape, in the official compiler's words. For example, `let await = 1` gives "Cannot use keyword 'await' outside an async function".
