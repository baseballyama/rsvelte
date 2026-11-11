# `typescript-reactive-prop-read.svelte`

**Issue:** [#3934](https://github.com/baseballyama/rsvelte/pull/3934)

A legacy prop read in a TypeScript reactive block whose nested callback has an annotated parameter. The scope-aware prop-read pass parsed every fragment as JavaScript, so one type annotation made the entire block fall back to the heuristic text scanner and left `if (tab)` bare instead of emitting `if (tab())`.
