---
"@rsvelte/compiler": patch
---

`parse()`'s `Root.end` is now the source length rather than the last non-whitespace byte. Upstream parses `template.trimEnd()` but sets `this.root.end = template.length` on the untrimmed source, so the root span always covers the whole file; rsvelte stopped short on every component ending in a newline — 12,324 of 14,102 real-world components — which loses the trailing bytes for any consumer round-tripping a document through `source.slice(root.start, root.end)`. The parser fixture harness now also trims its input the way upstream's `tests/parser-{modern,legacy}/test.ts` does; without that the two errors cancelled and the suite was green because both sides were wrong.
