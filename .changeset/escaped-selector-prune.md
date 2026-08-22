---
"@rsvelte/compiler": patch
---

Prune a rule whose class, id or type selector carries a CSS escape. `structural_simple_selector_is_evaluable` bailed on any name containing `\` because the matcher compared it un-decoded, so `.a\:b > *` was kept as used against an element with no element children — the shape every Tailwind arbitrary-value class (`w-1/2`, `[&>*]:mt-2`) takes.
