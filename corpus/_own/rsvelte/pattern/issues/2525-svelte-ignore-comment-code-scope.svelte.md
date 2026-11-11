# `2525-svelte-ignore-comment-code-scope.svelte`

**Issue:** [#2525](https://github.com/baseballyama/rsvelte/issues/2525)

The warnings *about* `svelte-ignore` comments (`unknown_code`, `legacy_code`) are themselves ignorable: upstream raises them through the same `w()` that consults the ignore stack, so an enclosing `<!-- svelte-ignore unknown_code -->` silences the nested comment's own diagnostic, while rsvelte pushed them straight onto the warning list. The second `<div>` carries the same shape with **no** enclosing ignore and pins the other direction — exactly one `unknown_code` must survive, on all three targets. Only the warning ratchets can see this file; its generated JS is identical either way
