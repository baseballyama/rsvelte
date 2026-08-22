---
"@rsvelte/lint": patch
---

`svelte/sort-attributes` now honours an `order` pattern that uses lookaround.

The `order` option takes JS regexes, and Rust's `regex` crate implements no lookaround, so a pattern like `"/^(?=x-)x-a$/u"` failed to compile and its group was silently dropped — the rule then reported nothing for the attributes that group was meant to order. `regex` is still tried first and every default pattern compiles there, so the backtracking fallback is unreachable from the default path.
