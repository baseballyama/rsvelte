---
"@rsvelte/compiler": patch
---

Stop the per-statement client transform chain from copying a statement it did not rewrite. Nine of its stages now return their input borrowed when they find nothing to do, and the two loop-invariant legacy-state name vectors are built once instead of once per top-level statement. Output is unchanged.
