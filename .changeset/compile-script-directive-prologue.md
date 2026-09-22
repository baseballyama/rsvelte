---
"@rsvelte/compiler": patch
---

compile(): a `<script>`'s directive prologue reaches the generated module

Phase 3 re-parses generated text and rebuilt each result from `Program::body`,
but OXC lifts a directive prologue into `Program::directives` — so `"use strict"`
was deleted from the client and server output. The server's re-parse is
per statement, which made *any* top-level string-literal statement the whole
prologue of its own parse, so it lost one that was not even first.
