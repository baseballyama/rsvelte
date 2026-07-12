---
"@rsvelte/compiler": patch
---

fix(transform): use byte offsets when slicing instance-script strings

Several client instance-script string helpers iterated with
`chars().enumerate()` (or a collected `Vec<char>`) and then used the resulting
char index as a byte offset into the original `&str`. Any non-ASCII byte before
the slice point (a non-ASCII identifier, object key, string/type literal — all
valid JS/TS/Svelte) pushed the byte offset past a `char` boundary, panicking the
compiler with `byte index N is not a char boundary`. Because these helpers run
whenever the client instance-script IR is built, the crash was reachable from
untrusted `.svelte` input.

Fixed all five sites to work in byte offsets (`char_indices()` /
peekable-iterator neighbor lookups) so e.g. `let { café, b } = $props()`,
`let { café: renamed } = $props()`, `let [café = 1] = arr`, and
`let x: Café = 0` compile instead of panicking:

- `props_transforms.rs`: `split_property_key_value`, `split_destructuring_properties`
- `destructure_transforms.rs`: `find_top_level_equals` (fixes its 11 byte-slicing callers)
- `state_transforms.rs`: `body_references_identifier_in_statements`,
  `transform_legacy_state_declarations`

ASCII input is unaffected (char index equals byte index there), so output is
byte-for-byte unchanged.
