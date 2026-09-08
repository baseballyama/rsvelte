# `3189-bound-dollar-and-double-dollar.svelte`

**Issue:** [#3189](https://github.com/baseballyama/rsvelte/issues/3189)

Names that ARE `$` or start with `$$` in every position that BINDS one — a parameter, an arrow parameter, a `catch` parameter, an each item, a snippet parameter — all of which rsvelte reported as `global_reference_invalid`. Upstream never inspects identifiers for this: it reads the module scope's leftover references, so a name that resolves is not in the population. `$$p` and `$$x` are here beside `$` because the three sites that raise the error do not share one guard
