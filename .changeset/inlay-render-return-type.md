---
"@rsvelte/language-server": patch
---

Drop the inlay hint on the generated `$$render` return type

Upstream's `InlayHintProvider` filters hints against the generated TSX before
mapping them back, and one of its predicates is the return-type slot of the
`$$render` function svelte2tsx emits. rsvelte forwarded tsgo's hints unfiltered,
so every component reported a return-type hint for a function the user never
wrote.

Measured against the live official server over the `upstream-features` and
`upstream-testfiles` suites, on a tree with #4488 merged: 40 divergent keys
retired, 0 new, and 0 movement outside `textDocument/inlayHint` in either
direction. All 17 carriers are `lang="ts"` components.
