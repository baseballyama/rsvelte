# `3209-lt-in-text.svelte`

**Issue:** [#3209](https://github.com/baseballyama/rsvelte/issues/3209)

`lead < trail` inside a `<p>`, where the same empty name is followed by real input. Upstream validates the empty name like any other and raises `tag_invalid_name`, so the two halves of the branch report different codes and one file cannot cover both
