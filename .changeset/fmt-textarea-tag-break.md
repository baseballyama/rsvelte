---
"@rsvelte/fmt": patch
---

A `<textarea>` with multiline (or overflowing) content now breaks its tags the way prettier does — `>` drops one indent level onto its own line when the content starts inline, and the close tag becomes `</textarea\n>` when it ends inline — so no formatter-inserted newline changes the rendered value. Attributes stay on the open line (the per-line attribute breaking is `<pre>` behavior).
