import * as $ from 'svelte/internal/server';

export default function Unknown_prop01_input($$renderer) {
	let div;
	const remove = () => div.unknown = '';

	$$renderer.push(`<div>div</div> <button>Click Me</button>`);
}