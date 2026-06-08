---
"@rsvelte/svelte2tsx": patch
---

Fix the `@rsvelte/compiler` dependency range. `0.1.13` and `0.1.14` shipped a
wrong `^0.1.0` range (the same `pkg/` version leak that broke the compiler
publish caused pnpm to resolve the `workspace:^` range against the stale
`0.1.0`), which pulled a months-old compiler. This release restores the
correct `^0.7.x` range.
