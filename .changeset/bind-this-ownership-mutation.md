---
"@rsvelte/compiler": patch
---

Dev-mode client output now applies ownership validation to `bind:this={obj.foo}` targets whose root is a prop. Upstream builds the `bind:this` setter by visiting a synthesized `obj.foo = $$value` assignment, so it flows through `validate_mutation()`; rsvelte built that setter directly and therefore emitted neither `$$ownership_validator.mutation(...)` nor the `$.create_ownership_validator($$props)` preamble. As upstream does, the flag that emits the preamble is set before the property path is built, so a target with an unbuildable path (e.g. `bind:this={parents[config.testcase]}`) still gets the preamble.
