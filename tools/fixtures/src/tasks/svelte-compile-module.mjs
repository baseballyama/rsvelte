import { compileModule } from 'svelte/compiler';
import { compileArtifacts } from './svelte-shared.mjs';

export default {
	id: 'svelte.compileModule',
	storage: 'committed',
	oracles: ['svelte'],
	variants: [
		{ id: 'client', options: { generate: 'client' } },
		{ id: 'server', options: { generate: 'server' } }
	],
	appliesTo: (unit) => unit.lang === 'svelte-module-js',
	run: (unit, src, variant) => compileArtifacts(() => compileModule(src, { filename: unit.path, ...variant.options }))
};
