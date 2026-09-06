---
'@rsvelte/compiler': patch
---

fix(sourcemap): the annotation end survives split coordinates too

`(binding end, annotation end)` reached only the re-parsed span's end lookup.
A comment anywhere in the script moves the printer onto split coordinates,
where an end position is resolved through `loc_map` instead — and the copied
run carried no override there, so the segment pointed back at the annotation's
colon. `LocRange` now carries the pair and the end lookup consumes it on both
routes.
