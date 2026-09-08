# `3150-option-value-ternary.svelte`

**Issue:** [#3150](https://github.com/baseballyama/rsvelte/issues/3150)

`<option value={a ? b : c}>` kept a `?? ''` upstream drops, because rsvelte's `is_defined` predicate had no conditional arm. The logical form is here for the same reason, and a genuinely-undefined value is the control that must keep its guard
