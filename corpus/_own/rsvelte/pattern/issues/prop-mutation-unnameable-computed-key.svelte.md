# `prop-mutation-unnameable-computed-key.svelte`

**Issue:** corpus residue

`validate_mutation` accepts a computed key only as a `Literal` or an `Identifier` and returns the expression unwrapped for anything else. A member, template-literal or binary key must therefore be neither wrapped nor counted as a source site — counting it shifts the location of the one key that *is* nameable, which is the row's positive control. One residue is left open deliberately and is **not** in this file: the wrap runs on generated text, where a legacy prop's transformed key `k()` and a source-level call key `g()` are the same shape, so an unnameable *call* key is still accepted through the legacy path. It cannot be written as a pattern here because no source spells the difference — it occurs 0 times in the collected corpus, and whether it is reachable at all is **unmeasured**.
