# `2988-rune-call-text-in-a-regex.svelte.js`

**Issue:** [#2988](https://github.com/baseballyama/rsvelte/issues/2988)

The other direction of the same scan: `/$derived(x)/` and `/$state(x)/` are ordinary regexes (`$` anchors, `(x)` captures) that the module rune loops rewrote as if they were calls — into `/$.derived(() => x)/`, `/$.state($.proxy(x))/` on the client and `/x/` on the server. Three different regular expressions, all of which parse
