---
'@rsvelte/compiler': patch
---

Read a directive's value once, the way upstream does. `directive_invalid_value` (`<div use:n="a">`) and `expected_attribute_value` (`<div use:n=>`) were never raised from the directive path because all eight per-directive parsers hand-rolled their own value read; `style_directive_invalid_modifier` is now also reported on `<svelte:body>`, `<svelte:window>` and `<svelte:document>`.
