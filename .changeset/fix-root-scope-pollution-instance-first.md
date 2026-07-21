---
"@rsvelte/compiler": patch
---

fix(analyze): insert instance-scope declarations into the root-scope name map before module-script inner-function scopes, so a same-named function parameter in the module script no longer shadows an instance `let` (restoring its reactivity)
