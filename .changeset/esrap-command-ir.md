---
"@rsvelte/compiler": patch
---

Cut Command-IR overhead in the `rsvelte_esrap` printer (~-31% esrap, -5.7% client compile, -3.3% server compile) with byte-identical output. Track `measure`/`empty` incrementally, store command text inline, flatten the source-map accumulator to a single list of the newly exported `Mapping`, recycle command buffers between prints, and build the source line index once per print. `rsvelte_esrap` is released as 0.9.0 (the `PrintWithMap::mappings` shape changed) and `rsvelte_core` pins the new exact requirement.
