# `3058-server-number-spelling.svelte`

**Issue:** [#3058](https://github.com/baseballyama/rsvelte/issues/3058)

Folded numbers must render in JS spelling: `$derived(1e-7)` / `$derived(1e21)` reached the SSR template as `0.0000001` / `1000000000000000000000` through `try_evaluate_with_constants`, which printed with Rust `Display` — the one fold path #3044 missed
