---
"@rsvelte/vite-plugin-svelte-native": minor
"@rsvelte/vite-plugin-svelte": minor
---

feat(napi): bridge dynamic cssHash functions through an async callback

Adds a `compileWithCssHash` async NAPI entry that runs the compile under
`block_in_place` while a threadsafe callback services the user's `cssHash`
function on the JS thread — so a CSS-content-dependent scope hash is faithfully
supported. `compileAsync` routes a function `cssHash` through it (supplying
Svelte's exact `hash()` implementation as the callback's `hash` argument); the
synchronous `compile` throws a clear error for a dynamic `cssHash` rather than
silently dropping it. A callback that throws aborts compilation with that error
(matching upstream, where a `cssHash` exception propagates); a callback that
returns a non-string falls back to the default `svelte-<hash(css)>`.
`@rsvelte/vite-plugin-svelte` uses the async path when a `cssHash` function is
configured. Callers that don't pass a `cssHash` function keep the existing
zero-overhead synchronous path.
