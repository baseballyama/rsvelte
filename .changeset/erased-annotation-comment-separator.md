---
"@rsvelte/compiler": patch
---

compiler: an erased annotation's comment keeps the line it shared with the initializer

A comment left behind by an erased TypeScript annotation is flushed at the
initializer's start, and the flush wrote a newline after it unconditionally.
Upstream's printer does not: esrap keeps a leading comment inline when it shared
the anchored node's source line and breaks only where the source broke. So a
one-line annotation came out on three lines where official keeps one (#4397).

The separator is now read off the text between the comment's end and the flush
point — not off the shape of the annotation and not off the shape of the
initializer. A newline *before* the comment still prints inline, a multi-line
initializer still prints inline, and a newline *after* the comment still breaks.
A `//` comment always breaks, since a space there would swallow the rest of the
line. The two in-place call sites — a whole erased *statement*, which has no
flush point — keep the newline they had, which is what leaves the `type` alias
and `interface` cells unchanged.

Measured on nine cells against Svelte 5.57.0: three go from divergent to
byte-equal on **both** the client and the server, none goes the other way, and
78 neighbouring cells across six sibling grids are byte-identical between the
arms. The separator is one byte either way, so every source-projection offset is
unchanged.
