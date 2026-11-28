import { compile } from 'svelte/compiler';
import type { Artifact, Task } from '../types.ts';
import compileTask from './svelte-compile.ts';

// The map of the module svelte.compile writes: the corpus reads its JavaScript there, so the map
// keeps only the segments, which carry every position it compares.
const task: Task = {
	id: 'svelte.compile.sourcemap',
	oracles: ['svelte'],
	variants: compileTask.variants,
	appliesTo: compileTask.appliesTo,
	run: (unit, src, variant): Record<string, Artifact> => {
		let mappings: string;
		try {
			({ mappings } = compile(src, {
				filename: unit.path,
				runes: true,
				...variant.options,
			}).js.map);
		} catch (e) {
			// svelte.compile records the rejection.
			if ((e as { code?: string }).code) return {};
			throw e;
		}
		return {
			map: {
				text: JSON.stringify({ version: 3, mappings }) + '\n',
				ext: 'js.map',
				compare: 'json',
			},
		};
	},
};
export default task;
