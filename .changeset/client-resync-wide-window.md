---
"@rsvelte/compiler": patch
---

fix(compiler): a client source-map resync no longer anchors a token inside a string literal

The text alignment that maps generated instance-body bytes back to the script
re-anchored on the next equal byte whenever it found no candidate agreeing for a
token's worth of bytes inside a 32-byte window. A dropped `import` is longer than
that window, so `const xKey` anchored on the `c` of `'../../_data/points.csv'`
and its end anchor landed past that line's end.
