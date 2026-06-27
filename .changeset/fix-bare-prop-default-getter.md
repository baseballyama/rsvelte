---
"@rsvelte/compiler": patch
---

fix(transform): keep a bare prop-identifier prop default as a getter reference

A legacy `export let b = a` where `a` is another prop lowers to
`$.prop($$props, 'b', 24, a)` — the prop's getter function is passed directly as
the lazy initial value. The default-value prop-read pass was wrapping the bare
`a` into `a()`; it now leaves an exactly-bare prop-identifier default untouched
while still wrapping prop reads nested in a larger default.
