import * as $ from 'svelte/internal/server';

export default function Computed_member01_input($$renderer) {
	let div;
	const remove = () => div[remove]();

	$$renderer.push(`<div>div</div> <button>Click Me</button>`);
}