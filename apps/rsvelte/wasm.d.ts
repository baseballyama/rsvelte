// The module that `node scripts/generate.ts` builds into generated/wasm/, typed before it is built.
declare module '#wasm' {
	import type { Module } from './wasm-binding.js';
	export default function init(): Promise<unknown>;
	export function initSync(options: { module: BufferSource }): unknown;
	export const version: Module['version'];
	export const compile: Module['compile'];
	export const compileModule: Module['compileModule'];
}
