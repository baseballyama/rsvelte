---
"@rsvelte/vite-plugin-svelte-native": patch
---

Raise option-validation failures in upstream's `CompileError` shape. `compile()` and `compileModule()` now throw an error carrying `code: 'options_invalid_value'`, `name: 'CompileError'`, the `filename` that was passed in, and the `https://svelte.dev/e/options_invalid_value` message tail — previously the thrown value was a plain `Error` whose `code` was napi's `"GenericFailure"`, so a consumer branching on `err.code` could not tell an invalid option from any other failure. `customElement`'s message also loses the `, if specified` tail it never had upstream (it is validated by `parametric`, not `boolean`).

The change is in `crates/rsvelte_napi`, which ships only in the `@rsvelte/vite-plugin-svelte-native-*` binaries; the wasm `@rsvelte/compiler` carries its own port of `validate-options.js` and is unaffected (#3664).
