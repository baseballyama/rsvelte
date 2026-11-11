# `3145-meta-in-title-error-order.svelte`

**Issue:** [#3145](https://github.com/baseballyama/rsvelte/issues/3145)

Both compilers reject a `<svelte:window>` inside `<title>`, with different codes: rsvelte's content check ran first because its placement check lived in analysis while upstream's lives in the parser. Only the error-**code** comparison can see this — the output verdict scores the pair `error-parity` on the strength of both sides rejecting
