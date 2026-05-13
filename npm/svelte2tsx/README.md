# @rsvelte/svelte2tsx

Workspace package and changesets version anchor for the Rust port of `svelte2tsx`.

## Status

`private: true` until a runtime artifact is in place. The Rust implementation lives in `src/svelte2tsx/` and is already reachable through the napi binding (`napi_svelte2tsx`). To ship this package to npm:

1. Decide on a distribution channel:
   - **wasm** — add a `#[wasm_bindgen]` export for `svelte2tsx` in `src/wasm.rs` and re-export it through this package, OR depend on `@rsvelte/compiler` once that bundle exposes it.
   - **napi prebuilt binaries** — switch to a `napi-rs` style platform-package layout (this directory becomes the loader, plus a sibling matrix of `@rsvelte/svelte2tsx-<triple>` packages).
2. Add the entrypoint files (`index.js`, `index.d.ts`, etc.) and a `files` field.
3. Flip `private` to `false`.
4. Open a changeset (`pnpm changeset`) — the next merge to `main` will publish.

## Release flow

Versioning is handled by the same changesets pipeline as `@rsvelte/compiler`. See `.github/workflows/release.yml`. While this package is `private`, `changeset version` still updates its `version` and `CHANGELOG.md`, but `changeset publish` skips it.
