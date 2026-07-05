---
"@rsvelte/fmt": minor
---

feat(fmt): format CSS in-process via `oxc_formatter_css`

`rsvelte-fmt` now formats CSS with the Rust `oxc_formatter_css` crate (the same
engine `oxfmt` uses, so byte-identical) instead of spawning an `oxfmt`
subprocess — mirroring the existing native JS/JSON in-process paths. This covers
both embedded `<style>` blocks in `.svelte` files and standalone
`.css`/`.scss`/`.less` files, and it lets the wasm formatter format `<style>`
blocks in the browser (previously left verbatim, since spawning `oxfmt` can't run
in wasm).

The embedded-`<style>` path no longer needs the batch/daemon/on-disk-cache
machinery that existed only to amortize `oxfmt` spawns; the new `--no-native-css`
flag reverts to the legacy `oxfmt`-subprocess path as an escape hatch. Standalone
CSS files fall back to `oxfmt` on parse errors or when an `.oxfmtrc` override /
`printWidth > 320` can't be represented natively, exactly like the native JSON
path. Indented-syntax dialects (`sass`/`stylus`/`.styl`) are not brace-based CSS
and stay verbatim / delegated.
