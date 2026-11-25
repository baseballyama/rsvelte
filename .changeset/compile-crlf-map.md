---
'@rsvelte/cli': patch
---

The `js.map` of `compile` for a component with `\r\n` line ends keeps the mapping of its last line, which it dropped.
