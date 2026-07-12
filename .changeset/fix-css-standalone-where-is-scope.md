---
"@rsvelte/compiler": patch
---

fix(transform): scope a standalone `:where(...)` / `:is(...)` with a direct class

A relative selector that is exactly one `:where(...)` or `:is(...)` pseudo does
not bump specificity itself — upstream's CSS transform `continue`s past it
without setting `specificity.bumped`, so its inner content becomes the *first*
scoping point and gets a direct class. rsvelte was always wrapping the inner
scope in `:where(...)`, so

```css
:where(.foo) { … }
```

emitted `:where(.foo:where(.svelte-hash))` instead of the upstream
`:where(.foo.svelte-hash)`. The fix only affects a standalone `:is`/`:where`
that is the first scoped selector; a pseudo attached to other selectors
(`:root:has(...)`, `.foo:is(...)`) or one preceded by a bumping selector
(`ul :where(li)`) still keeps `:where(.svelte-hash)`, matching the official
compiler.

Because a standalone `:is`/`:where` does not bump specificity, a combinator that
follows one no longer flips subsequent selectors to `:where()` scoping either, so
`:where(A) > :where(B, C)` scopes `B`/`C` with a direct class on both sides
(`:where(A.svelte) > :where(B.svelte, C.svelte)`).
