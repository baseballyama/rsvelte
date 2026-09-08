# `3266-duplicate-this-component.svelte`

**Issue:** [#3266](https://github.com/baseballyama/rsvelte/issues/3266)

`<C bind:this={el} bind:this={el} />`, which upstream accepts because `read_attributes` never records a `this` name in its uniqueness set. rsvelte kept a SECOND duplicate check in phase 2 for components only, and that copy had no exemption — the parser's copy did, so the two disagreed and only the component host could see it
