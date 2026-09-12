# client source-map segments pointing past the end of a source line

**Issue:** [#4466](https://github.com/baseballyama/rsvelte/issues/4466)
**Repro:** none — `crates/rsvelte_core/tests/map_offset_past_source_4466.rs`

`RestoreRawMappedSpans::visit_span` returns without writing when a chunk offset
has no `copied_spans` translation, which leaves the node's span in **chunk**
coordinates — an offset into the transformed script text. Nothing downstream can
tell that apart from a source offset, so the map named a position no source line
can hold (69.9% of one carrier's segments).

Leaving the span located is deliberate: unlocating it instead changes `js.code`
on ten `pattern-corpus` files, all of them away from official. So the rejection
is at the two **map emission** sites (`Driver::LocationOffset` and
`Printer::map_position`), both of which now drop an offset past the mapped
source's length. `js.code` is byte-identical over the whole corpus.

Both sites are load-bearing: the `Driver` alone leaves 1,637 out-of-range
segments and `map_position` alone leaves 4,461, against 77 with both.

No repro can live here: the corpus gate compares `js.code`, which this does not
change.
