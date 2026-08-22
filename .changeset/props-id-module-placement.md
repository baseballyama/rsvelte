---
"@rsvelte/compiler": patch
---

Reject `$props.id()` outside a component's instance script. In a `<script module>` block or a `.svelte.(js|ts)` file it was compiled instead of raising `props_id_invalid_placement`, emitting a reference to an undefined global. Also update two error messages the official compiler has since reworded: `props_id_invalid_placement` and `props_invalid_identifier`.
