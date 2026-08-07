---
"@rsvelte/compiler": patch
---

Stop re-parsing a script when the in-place pass already found nothing

Every ported rewrite pass ran `in_place().or_else(spliced)`. `None` did not say
whether the in-place path failed to parse or simply found nothing to rewrite,
so the second, far commoner case re-parsed the whole source through the text
path only to reach the same answer. `with_program_mut` now returns a three-way
`Rewrite`, and only `NotParsed` falls back.

Driver re-parses on the open-webui corpus drop from 14,468 to 4,479 per run
(−69%). Interleaved paired runs: open-webui −7.1% (8/8), Huly plugins −5.5%
(6/6), carbon-components-svelte −3.9% (8/8).
