# `3194-strict-reserved-word.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

`let interface = 1` — one of the nine words strict mode reserves. `interface` specifically, because it is also a TypeScript declaration keyword and a scan that keyed on the word would reject `interface Foo {}`
