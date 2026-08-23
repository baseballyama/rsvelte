---
"@rsvelte/compiler": patch
---

A comment at the end of an instance script now follows esrap's comment cursor: on the server it lands in the first template expression that keeps a source location, at the end of the component body when there is none, and is dropped when a block gets printed first; on the client a comment below the last legacy `$:` is dropped, because the `$.legacy_pre_effect` block upstream builds for it carries no location. The same rule moves a comment trailing a `$:` on its own line, which upstream never flushes onto the loc-less label.
