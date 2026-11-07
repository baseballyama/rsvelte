import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let count = 0;
	let doubled = count * 2;

	$$renderer.push(`<button>clicks: 0</button>`);
}