---
'@rsvelte/compiler': patch
---

svelte2tsx: honour `mode: "dts"`, `typingsNamespace`, `emitJsDoc`, `noSvelteComponentTyped`, `version: "4"` and an absent `filename`

`mode: "dts"` emitted the `ts`-mode component declaration instead of the `.d.ts` interface block, so a
library packaged through rsvelte got a declaration file whose component type was the internal shape.
`typingsNamespace` was ignored (`svelteHTML` was hard-coded in every `createElement` /
`mapElementTag` call, and the `bind:` prefix was preserved unconditionally), `emitJsDoc` and
`noSvelteComponentTyped` never reached the conversion, `version: "4"` kept the Svelte-5 props shape
and emitted no class getters/accessors, and a call with no `filename` invented a component name
instead of using `$$Component`.

The JS option object is now parsed by one shared `Svelte2TsxOptions::from_json`, so the NAPI and wasm
bindings cannot drift apart.
