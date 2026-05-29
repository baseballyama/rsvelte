---
"@rsvelte/svelte-check": patch
---

- Escape GitHub Actions command property values in `--output machine`/GH-format diagnostics.
- Apply `warning_filter`, forward module-level warnings, and make machine output line-safe.
- Rebuild against the bundled `@rsvelte/compiler` correctness work.
