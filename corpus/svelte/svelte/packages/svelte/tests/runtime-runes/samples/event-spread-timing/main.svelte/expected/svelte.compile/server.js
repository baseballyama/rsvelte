import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const focus = (input) => {
		input.focus();
	};

	$$renderer.push(`<input${$.attributes({ ...{} }, void 0, void 0, void 0, 4)}/>`);
}