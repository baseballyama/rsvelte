import * as $ from 'svelte/internal/server';

export default function Skip01_input($$renderer) {
	// Comment 1
	// Comment 2
	let a = 1;

	let b = 2;
	let c = 3;

	$$renderer.push(`<div>Hello</div>`);
}