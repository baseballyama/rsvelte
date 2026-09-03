---
"@rsvelte/lint": patch
---

Stop two per-file byte-at-a-time scans from dominating the lint pass: 1.143x faster single-threaded over 3,000 real components (9,975ms -> 8,724ms, medians of 6 ABBA-ordered samples per arm, within-arm spread 1.007x/1.005x).

A profile of the benchmarked configuration (76 rules, single-threaded, 10,684 samples) put `LineIndex::new` at 13.67% of the whole pass — a function whose own doc comment says it is "built once per file" while the tree constructs it at 25-plus sites. Inside it, the check for whether the source holds U+2028/U+2029 walked `bytes.windows(3)`, so every construction paid a byte-at-a-time pass over the file; the line-start loop stepped one byte at a time as well. Both are now `memchr`/`memmem` searches, which is exact rather than approximate: `E2 80` is the shared prefix of both separators, so its absence rules them out in one vectorised pass.

`mustache_spacing::is_inside_pug_template` is the same shape one level up. It runs once per mustache and scanned the whole source for `<template` with `i += 1`, which is `sites x source_length` on a file with no pug template at all — the overwhelmingly common case. It also sliced `src[content_start..]` without bounding it, so a `<template lang="pug"` with no closing `>` panicked; the panic is now impossible rather than caught per file.

The unit tests these needed were the cells neither function had: an em dash (`E2 80 94`) reaches the separator search without being one, which is the only place the cheap prefix test and the real search can disagree; and a non-pug `<template>` followed by a pug one is what says the scan resumes after the first rather than stopping at it.
