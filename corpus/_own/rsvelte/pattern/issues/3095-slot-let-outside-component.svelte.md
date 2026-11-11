# `3095-slot-let-outside-component.svelte`

**Issue:** [#3095](https://github.com/baseballyama/rsvelte/issues/3095)

A `let:` on a `<slot>` outside a component's children is an ordinary deprecated attribute upstream (`"let:x":true`), not a `$$slot_def` binding; `build_slot_props_string` had no arm for it at all, so both cases fell into its catch-all and the prop vanished from the TSX
