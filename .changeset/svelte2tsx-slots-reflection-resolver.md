---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): close the three slots-reflection resolver gaps. A destructuring
`let:` value (`let:whatever={{ bla }}`) bound only the directive's own name, so
every leaf identifier stayed unresolved in the `slots` reflection instead of
resolving through `(({ bla }) => bla)(…$$slot_def['default'].whatever)`; slot-prop
resolution substituted identifiers by token without tracking object-literal
context, so an in-scope name in object **key** position (and inside a string
literal) was rewritten too (`{ item: … }` became
`{ __sveltets_2_unwrapArr(items): … }`); and a `{:catch e}` binding was not typed
as `__sveltets_2_any({})`. The `{#await}` opening-tag padding is now derived from
official `transform`'s collapsed-gap count (`2 + then + catch` spaces) rather than
a constant, which also fixes the bare and pending-only shapes.
