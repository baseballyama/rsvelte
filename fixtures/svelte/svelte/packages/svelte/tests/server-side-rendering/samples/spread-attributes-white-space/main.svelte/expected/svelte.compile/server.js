import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let props = { value: '\n\tbar\n' };

	$$renderer.push(`<input${$.attributes({ ...props }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ class: 'white space', ...{} }, void 0, void 0, void 0, 4)}/>`);
}