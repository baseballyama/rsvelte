import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const myaction = (node, data) => {
		// ...
	};

	$$renderer.push(`<div>...</div>`);
}