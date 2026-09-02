---
'@rsvelte/compiler': patch
---

Dev-mode `console.*` no longer wraps an argument whose value is known. A `$state` / `$derived` declaration is resolved through the rune's argument the way upstream's `scope.evaluate` does, in the lowered spellings the script passes see, and a declarator's verdict is keyed by the symbol it declares rather than by its name — so two declarations sharing a name no longer silence each other.
