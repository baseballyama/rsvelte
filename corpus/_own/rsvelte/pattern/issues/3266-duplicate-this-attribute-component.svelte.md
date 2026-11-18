# `3266-duplicate-this-attribute-component.svelte`

**Issue:** [#3266](https://github.com/baseballyama/rsvelte/issues/3266)

The plain-attribute spelling `this={tag} this={tag2}` on the same host. The exemption is on the NAME, not on `bind:`, so a fix keyed on `BindDirective` leaves this row rejected
