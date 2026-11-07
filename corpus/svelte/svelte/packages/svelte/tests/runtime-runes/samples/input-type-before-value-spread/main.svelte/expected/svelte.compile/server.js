import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const value = 'line1\nline2\nline3';
	const spread = { name: 'field', value };

	$$renderer.push(`<input${$.attributes({ ...spread, type: 'hidden' }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'hidden', ...spread }, void 0, void 0, void 0, 4)}/>`);
}