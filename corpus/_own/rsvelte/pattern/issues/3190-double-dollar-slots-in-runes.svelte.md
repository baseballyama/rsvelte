# `3190-double-dollar-slots-in-runes.svelte`

**Issue:** [#3190](https://github.com/baseballyama/rsvelte/issues/3190)

A `$$`-prefixed name the template BINDS is legal in runes mode — the check reads unresolved references, so an each item or snippet parameter is not one. A check keyed on the name alone rejects both. `$$props` itself cannot be the binding here: upstream renames any reference to it, which is #3192
