---
"@rsvelte/compiler": patch
---

A comment written inside a template expression is no longer dropped. Upstream gives esrap one source-ordered comment list for the whole file, so a comment flushes at whichever located node the printer reaches next — which means a constant-folded tag hands its comment to the following expression instead of taking it away. rsvelte carried template-expression comments nowhere at all, on client, server and dev alike.
