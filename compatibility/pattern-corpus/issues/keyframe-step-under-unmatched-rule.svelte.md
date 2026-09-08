# `keyframe-step-under-unmatched-rule.svelte`

**Issue:** corpus residue

A `@keyframes` percentage step is scoped through its parent rule chain. Under a rule matching no element the step scopes nothing, where a whole-component flag scoped every element.
