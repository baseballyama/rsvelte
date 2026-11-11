# `broken-mustache-in-place.svelte`

**Issue:** [#4310](https://github.com/baseballyama/rsvelte/issues/4310)

A content-level mustache that has to break across lines was rebuilt at the width its continuation lines get, with its first line laid out as if it started at the indent and its last line as if nothing followed it, so `Best happened at {categoryData.record_holders.max_distance` overflowed the line where the oracle breaks after `record_holders`, the member that still fits at the column the `{` sits at. prettier measures every JS group of the mustache in place, the first against the prose before it on the line and the last against the `}` and anything glued to it up to the next break opportunity; the printer now rebuilds the broken form with both charges. Committed in the oracle's formatted form; on the tree without the fix the mustache is re-broken one member later.
