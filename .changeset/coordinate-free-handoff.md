---
"@rsvelte/compiler": patch
---

Add `Converted::into_coordinate_free_program`, so a consumer that wants the client OXC `Program` instead of the printed JavaScript can adopt it without re-parsing. Measured on 5,836 shipped components, the share a native bundler can take directly goes from 3.02% to 100%, replacing a re-parse worth 7.5% of compile with a strip worth 0.79%.
