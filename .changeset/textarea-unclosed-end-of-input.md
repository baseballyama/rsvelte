---
"@rsvelte/compiler": patch
---

Report an unclosed `<textarea>` as `unexpected_eof` at the end of the template, matching the official compiler. `<textarea>` is escapable raw text, so upstream reads its body with `read_sequence`, which raises `unexpected_eof` when the closing tag never arrives; rsvelte reported the generic `element_unclosed` at the opening tag instead.
