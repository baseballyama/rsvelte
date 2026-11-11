# `3134-nesting-selector-in-pseudo-args.svelte`

**Issue:** [#3134](https://github.com/baseballyama/rsvelte/issues/3134)

`.a:is(&)` compiled: a `&` inside pseudo-class arguments was judged "is it first within these args" instead of upstream's single rule about the whole prelude. The error it now raises also carries the `&`'s span, which no output verdict can see because `code` is the only field they compare
