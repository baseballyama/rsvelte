# `4046-rune-tail-comment-past-effect.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

The [#3070](https://github.com/baseballyama/rsvelte/issues/3070) shape with a removed `$effect` after it: replaying that effect's comment at the component tail must not re-anchor the last statement, which would drop the region that statement owns, and the lowered rune declaration has no `loc` end at all — a truncated one reads as a detached comment and prepends a blank line.
