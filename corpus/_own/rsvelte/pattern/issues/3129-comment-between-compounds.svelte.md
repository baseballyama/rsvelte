# `3129-comment-between-compounds.svelte`

**Issue:** [#3129](https://github.com/baseballyama/rsvelte/issues/3129)

A comment where a compound selector should begin. Upstream's `read_selector` rewinds past a comment and re-enters its loop, where every branch declines a `/` and `read_identifier` reports the empty name; rsvelte skipped comments unconditionally, so the six inter-compound placements all compiled. The position, not the content, is the discriminator — the nine placements upstream tolerates already agreed
