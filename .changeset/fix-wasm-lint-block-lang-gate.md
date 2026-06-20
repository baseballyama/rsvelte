---
---

Internal: fix the **Deploy Docs to GitHub Pages** wasm build. The
`block_lang_source_scan_diagnostics` parse-failure fallback (and its `style_scan`
helper) in `rsvelte_lint` produce native-only `svelte_check` diagnostics via
`validator::to_dsev` and `svelte_scan`, but were not gated behind
`#[cfg(feature = "native")]`. The playground wasm build
(`wasm-pack build crates/rsvelte_lint --no-default-features --features wasm`)
therefore failed with E0433/E0432 on `crate::svelte_scan` / `crate::validator`.
The fallback is only ever invoked from the native `runner`, so it and its
native-only imports are now gated; the always-compiled `BlockLang` AST rule is
unchanged. No published package is affected (`rsvelte_lint` is not released).
