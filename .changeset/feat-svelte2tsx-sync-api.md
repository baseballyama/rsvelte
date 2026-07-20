---
"@rsvelte/svelte2tsx": minor
---

feat(svelte2tsx): synchronous API matching upstream (drop-in `svelte2tsx()`)

`svelte2tsx()` is now **synchronous**, exactly like the official
[`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx)
— it returns the result object directly instead of a `Promise`. The previous
async signature existed only to lazily initialise the WebAssembly module; the
`@rsvelte/compiler` wasm bundle already exports `initSync`, so on Node the module
now self-initialises synchronously (`initSync` + `fs.readFileSync`) on the first
call, with no init cost thereafter.

Existing `const r = await svelte2tsx(...)` code keeps working unchanged (awaiting
a plain value returns it); only code that chained `.then()`/`.catch()` on the
result needs updating — hence a minor bump.

For browsers or bundlers without a synchronous `node:fs`, a new
`initialize(input?)` async export pre-loads the wasm (pass the bytes or a
compiled `WebAssembly.Module`); after `await initialize(...)`, `svelte2tsx()` can
be called synchronously.
