import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let props = { value: 'bar', form: 'qux', list: 'quu' };

	$$renderer.push(`<input${$.attributes({ ...props }, void 0, void 0, void 0, 4)}/>`);
}