---
"@rsvelte/compiler": patch
---

Decode character references in `<textarea>` content. It is escapable raw text, so `&lt;` is a `<`; rsvelte copied the text node's `data` from its `raw`, which escaped the source spelling a second time and rendered `&lt;` literally.
