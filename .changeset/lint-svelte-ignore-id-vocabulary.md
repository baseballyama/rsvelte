---
'@rsvelte/lint': patch
---

`svelte-ignore` no longer suppresses a `svelte/<rule>` plugin id.

Its id vocabulary is the compiler's warning codes; ESLint rule ids belong to
`eslint-disable*`. rsvelte registered every token, so
`<!-- svelte-ignore svelte/no-at-html-tags -->` silenced the rule while
`no-unused-svelte-ignore` still reported the comment as unused — the two halves
contradicting each other on one line. Measured against eslint-plugin-svelte over
all four directive x id cells; only this one diverged.
