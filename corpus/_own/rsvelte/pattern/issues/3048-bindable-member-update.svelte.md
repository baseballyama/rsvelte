# `3048-bindable-member-update.svelte`

**Issue:** [#3048](https://github.com/baseballyama/rsvelte/issues/3048)

A member **update** (`p.a++`, `--p.deep.c`) on a `$bindable()` prop in the instance script must wrap in the setter (`p(p().a++, true)`) or the parent is never notified — assignments on the same prop already wrapped. Dev adds the ownership-validator wrap OUTSIDE the setter, whose payload-skip only knew assignments
