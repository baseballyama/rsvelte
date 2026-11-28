import type { Task } from '../types.ts';
import { withDocument } from './language-server.ts';

const task: Task = {
	id: 'svelte.symbols',
	oracles: ['svelte-language-server'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte',
	run(unit, src) {
		const symbols = withDocument(unit.path, src, (html, opened) => html.getDocumentSymbols(opened));
		// Each is a field of the document, so only its name, place and parent tell them apart.
		const kept = symbols.map((symbol) => ({
			name: symbol.name,
			containerName: symbol.containerName,
			range: symbol.location.range,
		}));
		return { symbols: { text: JSON.stringify(kept), ext: 'symbols.json', compare: 'json' } };
	},
};
export default task;
