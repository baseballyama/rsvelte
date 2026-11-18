# `3034-host-rune.svelte`

**Issue:** [#3034](https://github.com/baseballyama/rsvelte/issues/3034)

`const host = $host()` — the rune parsed as an auto-subscription to a store named `host`, synthesizing `$.store_get(host, "$host", …)` machinery and a self-referential TDZ read, on every target
