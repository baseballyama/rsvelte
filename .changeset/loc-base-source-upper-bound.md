---
"@rsvelte/compiler": patch
---

client: the comment coordinate boundary clears the source, so a source offset cannot read as comment space

`loc_base` separates the two coordinate spaces the client printer works in:
below it, an offset is a real source position with no comment-space location;
at or above it, an offset indexes the synthetic comment buffer. It was computed
as `synth.max_span + 2`, and `max_span` is the running max of whatever the probe
pass happened to note — chunk text lengths, some statement ends, some
`RawMapped` source offsets. Nothing made that an upper bound on the source
offsets the printer actually resolves, so on a file whose template outgrew its
largest chunk a genuine source offset sat above `loc_base` and was
indistinguishable from a buffer offset by the only test either consumer has
(#4521).

The quantity that *is* an upper bound is the source length, and
`program_to_oxc_with_islands` now takes it. `has_loc` therefore means what it
says, and the printer stops treating a template identifier's position as a
comment-space one.

Over 34,930 real-world components, `js.code` moves on one file and moves toward
official (18 differing lines to 11; the `var … = $.sibling(…)` region becomes
byte-identical, where before four comments were parked on the wrong declarator).
Pairing map segments by generated position across 1,016 files whose maps move:
256 segments go from pointing at the wrong identifier to the right one, and none
goes the other way.
