# `3210-slash-before-attribute.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

`<br / title="a">` — upstream's `eat('>', true, false)` runs immediately after the optional `/`, so whitespace between them is not consumed first and the point is the byte after the `/`
