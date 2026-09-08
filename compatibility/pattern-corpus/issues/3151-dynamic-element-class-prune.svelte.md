# `3151-dynamic-element-class-prune.svelte`

**Issue:** [#3151](https://github.com/baseballyama/rsvelte/issues/3151)

`<svelte:element class={a ? 'x' : 'y'}>` flagged every class selector as reachable, because the possible-value expansion lived in the regular-element visitor and the dynamic one had a copy that only knew "expression ⇒ unknown". Quoted and unquoted are both present: they are different `AttributeValue` variants and the copy was wrong for both
