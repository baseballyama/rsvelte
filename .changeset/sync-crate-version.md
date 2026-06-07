---
"@rsvelte/fmt": patch
---

fix(release): sync the Rust crate version into `crates/rsvelte_fmt/Cargo.toml` (and `Cargo.lock`) during the release, so `rsvelte-fmt --version` matches the published `@rsvelte/fmt` package instead of reporting a stale `0.1.0`. `sync-version.mjs` previously only mirrored `@rsvelte/compiler` → `rsvelte_core`; it now also mirrors `@rsvelte/fmt` → `rsvelte_fmt` (#745)
