---
'@rsvelte/svelte-check': patch
---

Print a walk / compile / overlay / typecheck / post wall-clock split to stderr when `RSVELTE_CHECK_TIMING` is set. A single total cannot attribute a movement to any one of them, and the split shows that type checking is 66-89% of a run while overlay materialization is 8-29% — so `--incremental`, which reuses tsgo's program graph across runs, is worth 5.4-6.7x on a warm run and the overlay is not the lever it looks like.
