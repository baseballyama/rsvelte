---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

`hmr: true` now matches the official compiler in four places it diverged in: the `import.meta.hot.accept` hook calls `$.cleanup_styles(<hash>)` before the update when the component has CSS (so injected stylesheets no longer accumulate across hot updates), `customElements.define` is guarded by `customElements.get(tag) == null` (a second hot update of a custom-element component used to throw), and `is_standalone` is suppressed for a root component but *not* for a root `{@render}` — which restores the anchor comment on the client and the trailing `<!---->` hydration anchor on the server.

`js.map` no longer carries a `file` key (upstream's esrap-produced map has none; rsvelte emitted a constant `"input.svelte.js"`), and `outputFilename` no longer prefixes `js.map.sources` with `./` — the relative path is joined verbatim, as `get_relative_path` does upstream. The CSS map keeps its `file` key, which upstream does set.

`cssHash` works at the NAPI boundary. `compileWithCssHash` now invokes the callback the way the official compiler does — one `{ hash, css, name, filename }` argument, returning the scope class — so `({ hash, css }) => \`x-${hash(css)}\`` works verbatim, and a throwing callback rejects the returned promise instead of terminating the process. The synchronous entries (`compile`, `compileEnvelope`, …) now *reject* a function-valued `cssHash` naming `compileWithCssHash`, rather than dropping it and silently returning a different scope class.
