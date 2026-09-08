# `3190-runes-legacy-props.svelte`

**Issue:** [#3190](https://github.com/baseballyama/rsvelte/issues/3190)

`$$props` in runes mode, which rsvelte compiled into a reference to a global that does not exist. `$$restProps` appears FIRST in the source and the expected error is still `legacy_props_invalid` on line 5 — the two checks run in a fixed order, and the reference reported is the first in module → instance → template order rather than in source order, so a file with one reference pins neither
