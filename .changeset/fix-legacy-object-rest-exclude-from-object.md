---
"@rsvelte/compiler": patch
---

Legacy (non-runes) destructured declarations now lower an object rest as `$.exclude_from_object(tmp, [keys])` like the official compiler, instead of reading a non-existent `tmp.rest` property — and a rest bound to state keeps its `$.mutable_source` wrapper (plus the dev `$.tag` label). The same expansion also stopped dropping pattern defaults (`{ a = 1 }` / `[a = 1]` now emit `$.fallback(...)`) and stopped emitting invalid member reads for literal and computed keys (`tmp['b-c']`, `tmp[3]`, `tmp[key]`).
