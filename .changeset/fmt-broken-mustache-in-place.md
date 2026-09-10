---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fmt: rebuild a broken content mustache at the column it starts and against what follows it

A mustache in prose that had to break across lines was re-formatted at the
width its continuation lines get, as if its first line started at the indent
and nothing followed its `}`. prettier measures each JS group of the
expression in place — the first against the column the `{` sits at, after the
words before it on the line, and the last against the closing brace and any
text glued to it — so `Best happened at {categoryData.record_holders` now
breaks after the member that still fits on that line rather than after the one
that fits at the indent, and a mustache ending in `}.` leaves room for the dot.
