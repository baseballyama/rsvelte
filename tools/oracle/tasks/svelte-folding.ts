import type { Task } from '../types.ts';
import { withDocument } from './language-server.ts';

const task: Task = {
	id: 'svelte.folding',
	oracles: ['svelte-language-server'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte',
	run(unit, src) {
		const ranges = withDocument(unit.path, src, (html, opened) => html.getFoldingRanges(opened));
		return { folding: { text: JSON.stringify(ranges), ext: 'folding.json', compare: 'json' } };
	},
};
export default task;
