# `3201-template-fast-path-reserved.svelte`

**Issue:** [#3201](https://github.com/baseballyama/rsvelte/issues/3201)

`count + static` — the compound arm, reached only when an operand is an identifier that strict mode reserves. A guard keyed on the literal shapes alone leaves this one accepted
