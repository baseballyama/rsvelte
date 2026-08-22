---
"@rsvelte/compiler": patch
---

Report `slot_snippet_conflict` at the first `<slot>` element, falling back to the `$$slot` mention when there is none, instead of with no position at all. `slot_names` kept a placeholder string where upstream keeps the node.
