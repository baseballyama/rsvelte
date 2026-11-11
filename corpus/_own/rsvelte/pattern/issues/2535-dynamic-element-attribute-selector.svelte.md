# `2535-dynamic-element-attribute-selector.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

`<svelte:element>` deopted **attribute** selectors component-wide. An unknown tag name does not add attributes — upstream matches a `SvelteElement` against its declared attribute list like any other element, and only the *type* selector is exempt
