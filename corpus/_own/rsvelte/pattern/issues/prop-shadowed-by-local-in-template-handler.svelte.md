# `prop-shadowed-by-local-in-template-handler.svelte`

**Issue:** signal-discipline gate

The same shadow as `prop-shadowed-by-local-in-instance-script.svelte`, one entry point over: a template event handler's body is lowered by the expression converter, whose scope is the template's, so a name lookup reaches the prop. `data.isNew = false` became `data(data().isNew = false, true)` and `data.count++` became `data(data.count++, true)` — the assignment and the update are two lowerings and the first fix moved only the assignment. `items.selected = 1` / `items.count++` write an unshadowed prop from the same handler as the positive control. Found by `RSVELTE_ASSERT_SIGNAL_DISCIPLINE`, not by output equality: the one real-world file that reproduces it is already a listed entry on all three output ratchets for unrelated reasons, so no output gate could report it.
