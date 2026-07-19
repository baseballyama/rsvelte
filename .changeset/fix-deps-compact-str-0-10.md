---
"@rsvelte/compiler": patch
---

fix(deps): update compact_str to 0.10

Dependency-only bump of `compact_str` (0.9 → 0.10), the inline string type used
throughout the compiler's AST. No API or output changes; ships in the compiled
native binaries, hence a patch release.
