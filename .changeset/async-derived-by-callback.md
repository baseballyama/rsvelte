---
"@rsvelte/compiler": patch
---

Keep an `await` inside an async `$derived.by` callback from splitting the enclosing declaration into the async body.
