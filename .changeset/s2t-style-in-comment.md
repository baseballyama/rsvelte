---
'@rsvelte/compiler': patch
---

svelte2tsx: a `<style>` written inside an HTML comment no longer opens a style element

The fallback scanner that blanks style tags the parser did not capture searched the source for
`<style` with no regard for comments, so a comment mentioning `<style>` was treated as a start
tag and everything up to the file's real `</style>` was blanked — taking the attributes of every
element in between. Upstream's `findNextVerbatimElement` matches a comment before either verbatim
tag and skips it; the scan now does the same.
