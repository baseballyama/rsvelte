# `3160-special-host-block-child.svelte`

**Issue:** [#3160](https://github.com/baseballyama/rsvelte/issues/3160)

A control-flow block inside `<svelte:head>` and `<svelte:boundary>`, in the shape the oracle produces. rsvelte-fmt kept both hosts inline because the collapse pass ran no width/break pass on either node type, so the two hosts differed from every other one; the two are here together because they break into **different** shapes — the boundary never hugs, the head does
