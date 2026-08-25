---
"@rsvelte/compiler": patch
---

Attach the offending `$name` identifier range to `store_invalid_scoped_subscription` diagnostics in scripts and templates, matching the official compiler's start, end and code frame.
