# `3220-assign-rvalue-target.svelte`

**Issue:** [#3220](https://github.com/baseballyama/rsvelte/issues/3220)

`{42 = nope}` — acorn raises this one at the target's START, the only place it does not report where it stopped consuming, so the shared point-error helper reported the end. The message diverged too, and the two fields ratchet separately
