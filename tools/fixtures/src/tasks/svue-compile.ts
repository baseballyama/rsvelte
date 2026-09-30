import { compile } from 'svelte/compiler';
import { compileArtifacts } from './svelte-shared.ts';
import { toSvelte } from '../svue.ts';
import type { Task } from '../types.ts';

// The Svelte compiler on the component rewritten to Svelte syntax, with the unit's own path as
// `filename` (it feeds the component name and the CSS hash).
const task: Task = {
	id: 'svue.compile',
	storage: 'committed',
	oracles: ['svelte', '@vue/compiler-sfc'],
	variants: [
		{ id: 'client', options: { generate: 'client' } },
		{ id: 'server', options: { generate: 'server' } }
	],
	appliesTo: (unit) => unit.lang === 'svue',
	run: (unit, src, variant) => compileArtifacts(() => compile(toSvelte(src, unit.path), { filename: unit.path, runes: true, ...variant.options }))
};
export default task;
