---
"@rsvelte/compiler": patch
---

fix: compiler error messages now match the official compiler's wording

Asserting the validator fixtures' pinned message text (not just the error
code) surfaced 35 diagnostics whose wording had drifted from upstream
`errors.js` — among them `bind_invalid_target`, `transition_duplicate`,
`transition_conflict`, `rune_invalid_spread`, `script_duplicate`,
`illegal_element_attribute`, `event_handler_invalid_modifier`,
`attribute_invalid_type`, `state_field_invalid_assignment`,
`css_type_selector_invalid_placement`, `declaration_duplicate_module_import`
and the whole `svelte_options_*` family. All now emit upstream's exact text,
including the missing closing backtick in the `node_invalid_placement`
"not a `<div>`" suffix.
