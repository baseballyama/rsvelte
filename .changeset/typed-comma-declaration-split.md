---
"@rsvelte/compiler": patch
---

Split the instance script's multi-declarator `let` / `const` / `var` declarations from the OXC declarators instead of rebuilding the whole script line by line. Only the declarations that carry more than one declarator are rewritten, so a single `let a = 1, b = 2;` no longer reflows every other statement — and the line-scanning text pass it used (bracket balancing, comma splitting, per-line brace depth) is deleted, having had no other caller left.
