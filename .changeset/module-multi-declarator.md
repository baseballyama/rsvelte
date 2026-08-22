---
"@rsvelte/compiler": patch
---

Keep a multi-declarator `let a = …, b = …;` whole in a module script's server output. It was split into one statement per declarator for both entry points; the official compiler's `VariableDeclaration` visitor never splits, and the split it does produce in the instance script comes from an analyze-phase pass the module body does not go through.
