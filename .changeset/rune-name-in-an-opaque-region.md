---
"@rsvelte/compiler": patch
---

Stop lowering a rune NAME that is text rather than code. Two causes, both in `compileModule`. `skip_opaque` scanned a backtick like `'` and `"` — forward to the next unescaped copy — but a template literal's `${ … }` re-enters code and a nested template opens another, so `` `a ${`$state(0)`} b` `` came out as `` `a ${`$.state(0)`} b` ``; the signature was even nesting depth wrong, odd depth right. Separately, `$inspect` and `$inspect.trace` were removed by a raw `memmem::find` with no opacity check at all, so they vanished from a plain string, a line comment and an object key too. A 180-cell grid of 10 runes across 9 opaque hosts on both targets goes from 32 divergences to 0.
