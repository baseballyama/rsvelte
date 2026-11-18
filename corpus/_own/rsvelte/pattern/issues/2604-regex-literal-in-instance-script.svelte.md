# `2604-regex-literal-in-instance-script.svelte`

**Issue:** [#2604](https://github.com/baseballyama/rsvelte/pull/2604)

A regex literal whose closing slash follows an escaped one — `/^https?:\/\//` — in a legacy `$:` statement. The client text scanners must step over the literal, or the adjacent `//` reads as a line comment: the regex is emitted unterminated, the prop read after it is left uncalled, and a line ending in `… ') ||` stops looking like a continuation. The `total / 2` line pins the other side: a division must stay a division
