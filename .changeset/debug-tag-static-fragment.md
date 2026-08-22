---
'@rsvelte/compiler': patch
---

Stop emitting a `console.log`/`debugger` pair for a bare `{@debug}` inside a regular element. The official compiler discards that effect with the rest of `child_state.init` when the fragment is neither declaration-bearing nor dynamic, and a `{@debug}` with no identifiers is neither — rsvelte counted every `{@debug}` as a dynamism producer, so a `debugger;` statement reached non-dev client output. A `{@debug}` that names an identifier, or one outside a regular element, still emits
