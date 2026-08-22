---
"@rsvelte/compiler": patch
---

Call the getter for a `bind:value={get, set}` pair on `<select>` when rendering on the server. A sequence expression evaluates to its last operand, so emitting it whole handed `$$renderer.select` the **setter** as the value to match options against — no option was ever marked `selected`, and the server-rendered markup disagreed with what the client hydrates to. `<select>` reaches the renderer through `build_spread_object`, which had no collapse of its own; every other host went through `build_element_attributes`, which already had one.
