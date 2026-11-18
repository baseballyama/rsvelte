# `3026-template-arrow-bindable-member-assign.svelte`

**Issue:** [#3026](https://github.com/baseballyama/rsvelte/issues/3026)

The `$bindable()` half of the same defect. The mutation is wrapped as `p(p().a = …, true)`, a different builder (`prop_bindable_mutate`) reached by the same pre-transform, so a fix aimed only at the non-bindable wrapper leaves this one doubled
