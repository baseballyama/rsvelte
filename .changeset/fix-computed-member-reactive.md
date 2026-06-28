---
"@rsvelte/compiler": patch
---

fix(transform): treat a computed member with a reactive property as reactive

`has_reactive_state_json` only inspected a member expression's OBJECT, so
`{ xs: '…', … }[size]` (an inline object indexed by a reactive prop `size`) was
deemed non-reactive and emitted as a plain object property instead of a `get`
accessor. A computed member whose property reads reactive state is now treated as
reactive.
