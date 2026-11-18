# `3139-snippet-hoist-dynamic-nodes.svelte`

**Issue:** [#3139](https://github.com/baseballyama/rsvelte/issues/3139)

A root snippet containing `<svelte:element>` or `<svelte:self>` was never hoisted — both were rejected by node type where upstream judges references only. The file pairs each with a version that reaches instance state (an instance `const` tag, a `$state` attribute) and must stay pinned, because a blanket rejection scores those two right for the wrong reason
