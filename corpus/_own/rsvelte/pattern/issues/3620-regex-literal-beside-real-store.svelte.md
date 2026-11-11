# `3620-regex-literal-beside-real-store.svelte`

**Issue:** [#3620](https://github.com/baseballyama/rsvelte/issues/3620)

The opposite direction of the same scan. `$other` is spelled ONLY inside the regex and `$mystore` ONLY outside it, so a fix that skips too much loses a real subscription while this file still compiles — the failure a regex-only repro cannot see
