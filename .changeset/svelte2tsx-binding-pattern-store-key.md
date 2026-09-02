---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A `$`-prefixed key of a binding pattern is a store reference everywhere except
the pattern's first element, and rsvelte emitted no store subscription for any
of them — `let { a, $permissions: permissions } = o` lost its
`let $permissions = __sveltets_2_store_get(permissions);` line.

`processInstanceScriptContent` tracks "am I inside a declaration" with a single
boolean whose on-leave callback clears it unconditionally, so leaving a pattern's
first element clears a flag the enclosing pattern had set and every element after
it is walked as an expression. The rule that produces — a key is a name iff it is
the first element of its own pattern — is reproduced here, including the nested
cases where entering an inner pattern re-sets the flag. Reported as
`upstream_issues/svelte2tsx-isdeclaration-is-a-boolean-not-a-stack.md`.
