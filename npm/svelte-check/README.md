# @rsvelte/svelte-check

Workspace package and changesets version anchor for the Rust port of `svelte-check`.

## Status

`private: true` until the cross-platform binary distribution is wired up. The CLI is built from `src/bin/svelte_check.rs`.

The simplest path to shipping is the **prebuilt-binary loader** pattern (the same one napi-rs and `@biomejs/biome` use):

1. A GitHub Actions matrix builds `target/release/svelte-check` for `darwin-arm64`, `darwin-x64`, `linux-x64-gnu`, `linux-arm64-gnu`, `win32-x64-msvc`, etc.
2. Each binary is uploaded as a per-platform npm package (`@rsvelte/svelte-check-<triple>`).
3. This package becomes the loader: a `bin` field pointing at a tiny Node script that resolves the platform package via `optionalDependencies` and execs the bundled binary.
4. Flip `private` to `false` and let changesets/action publish all of them together.

## Release flow

Versioning is handled by the same changesets pipeline as `@rsvelte/compiler`. See `.github/workflows/release.yml`. While this package is `private`, `changeset version` still updates its `version` and `CHANGELOG.md`, but `changeset publish` skips it. The matrix-build step in CI will need to be added when the binary release is enabled.
