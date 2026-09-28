import { compile } from 'svelte/compiler';
import { compileArtifacts } from './svelte-shared.mjs';

// `filename` is the unit's path: it feeds the component name and the CSS scoping hash, so every
// implementation compared against these snapshots must pass the same value.
export default {
	id: 'svelte.compile',
	storage: 'committed',
	oracles: ['svelte'],
	variants: [
		{ id: 'client', options: { generate: 'client' } },
		{ id: 'server', options: { generate: 'server' } }
	],
	appliesTo: (unit) => unit.lang === 'svelte',
	run: (unit, src, variant) =>
		compileArtifacts(() => compile(src, { filename: unit.path, runes: true, ...variant.options }))
};
