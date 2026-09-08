# `class-value-kinds-upstream-evaluates.svelte`

**Issue:** css-prune probe

The other half of the allow list, and the reason it needs a second file: a single deopting element marks EVERY class selector in the component used, so a control selector in the same file as `class={`a b`}` reports nothing on either side and pins nothing. This file holds only the five node kinds upstream DOES evaluate — a string `Literal`, a `ConditionalExpression`, an `ArrayExpression`, an `ObjectExpression` and a `&&` `LogicalExpression` — plus one selector none of them can produce, which must stay reported. Without it, deleting the whole `gather_possible_values` body passes the deopt file.
