# @rsvelte/vite-plugin-svelte

Workspace package and changesets version anchor for the Vite plugin that delegates to the rsvelte compiler.

## Status

`private: true` until distribution is decided. The Rust side already exposes the napi bindings the plugin will use (`compile`, `preprocess`, `hmrDiff`, `resolveId` in `src/napi.rs`; helpers in `src/vps/`).

The plan in `docs/ecosystem-implementation-plan.md` (Wave 3) splits this into two npm packages:

- `@rsvelte/vite-plugin-svelte` (this directory) — the JS-side Vite plugin façade. Maintains the same public API as `@sveltejs/vite-plugin-svelte`, loads the native module, and translates Vite hooks into NAPI calls.
- `@rsvelte/vite-plugin-svelte-native` — the napi-rs prebuilt-binary package set (one per platform triple), produced by a matrix build.

To go live:

1. Add the napi-rs platform matrix build to CI (target the rsvelte crate with `--features napi`).
2. Create the `@rsvelte/vite-plugin-svelte-native` workspace package and its per-triple siblings.
3. Add the JS entrypoint here that imports from `@rsvelte/vite-plugin-svelte-native`.
4. Flip `private` to `false` on both packages.

## Release flow

Versioning is handled by the same changesets pipeline as `@rsvelte/compiler`. See `.github/workflows/release.yml`. While this package is `private`, `changeset version` still updates its `version` and `CHANGELOG.md`, but `changeset publish` skips it.
