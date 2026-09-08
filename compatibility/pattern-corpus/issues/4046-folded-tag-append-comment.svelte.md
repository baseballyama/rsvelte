# `4046-folded-tag-append-comment.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A comment inside a constant-folded expression tag that is an element's only child. The tag's comment reaches the `$.append` argument through the element's source anchor, so re-emitting it as an opaque chunk as well prints it twice — once leading the argument and once trailing it.
