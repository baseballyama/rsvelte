# `3179-export-const-state.svelte`

**Issue:** [#3179](https://github.com/baseballyama/rsvelte/issues/3179)

Every export shape whose `$$exports` entry depends on whether the binding is a **signal**: a plain `const`, a never-reassigned `$state` / `$state.raw` / `$derived`, and a reassigned `export let $state` beside them. The last is the direct control — it IS a source, so its getter must keep reading through `$.get` while the const ones stop. Both dev and non-dev matter and differ: non-dev collapses the non-signal export to a shorthand property, dev keeps a getter whose body is the bare identifier, so a file checked in only one mode confirms half the rule
