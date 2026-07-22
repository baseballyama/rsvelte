---
"@rsvelte/fmt": patch
---

fix(formatter): force block-header call expressions onto one line

A block header like `{#if isNodeVisible(node, nodes.find(...))}` whose call oxc
expands even at unlimited width (a hug-eligible last argument) was spliced into
the template as a raw multi-line fragment at the wrong indent. prettier-plugin-
svelte reprints block headers with `removeLines`, which keeps a group's baked
`shouldBreak` — so such a call joins onto one line with inner spaces
(`fn( a, b )`) while every other call collapses without them. The flat-args
expanded form is now folded back the same way: inner-space join for the shapes
oxc refuses to keep flat, plain single line otherwise.
