# `4046-reactive-nested-block-tail-comment.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A script-tail comment after a `$:` statement whose body holds a source-located block. Upstream appends the rebuilt effects after the rest of the instance body, so the comment is printed past them — leaving it before them makes the cursor the effect body killed unrecoverable, and the comment is dropped.
