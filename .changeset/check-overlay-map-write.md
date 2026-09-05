---
'@rsvelte/svelte-check': patch
---

The overlay stops writing a source map no run can read back.

Each component's shadow is accompanied by a `.svelte.tsx.map` on disk, written so a later
incremental run can recover the map without re-running svelte2tsx. Reading it back requires
a manifest entry, and `manifest::save` runs under `incremental` alone — so without
`--incremental` the write is dead: the map the run itself needs is already in memory on
`OverlayEntry`, and no later run can trust the file.

The overlay is where a large project's check time goes, and it is syscall-bound rather than
compute-bound: profiled on the report's own 5,000-component workspace, materialization is
62% of a `--tsgo` run and 95% of its samples sit in `libsystem_kernel` (`open` 38%,
`rename` 23%, `write` 14%, `close` 11%). Dropping one of the three files per component takes
the overlay from 15,006 files to 10,006 and measures 1.73x on overlay materialization and
**1.38x on the whole `--tsgo` run**, 16/16 pairwise wins each.

Both directions are pinned by artifact: with `--incremental` the maps are still written
(5,000 of them), without it none are, and `check-verify` reports 0 divergences on both the
`tsc` and `tsgo` backends.
