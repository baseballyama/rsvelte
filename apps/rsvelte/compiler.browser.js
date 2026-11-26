// rsvelte/compiler in a browser: the official svelte/compiler API over the WebAssembly module,
// which the bundler emits beside the code that imports it.
import init, * as wasm from '#wasm';

import { compiler } from './compiler-api.js';
import { wasmBinding } from './wasm-binding.js';

export { preprocess } from 'svelte/compiler';

await init();
const binding = wasmBinding(wasm);

/** The version of svelte whose output this compiler reproduces. */
export const VERSION = binding.VERSION;
export const { compile, compileModule } = compiler(binding);
