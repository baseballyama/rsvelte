# `3036-class-derived-outer-read.svelte`

**Issue:** [#3036](https://github.com/baseballyama/rsvelte/issues/3036)

A server class-field `$derived` reading a component-level derived — the emit loop read-wraps the whole class statement and the class-field lowering wrapped the extracted argument **again**, so `e` became `e()()`
