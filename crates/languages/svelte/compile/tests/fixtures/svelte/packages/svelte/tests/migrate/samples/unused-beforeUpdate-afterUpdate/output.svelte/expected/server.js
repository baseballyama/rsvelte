import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let count = 0;

	$$renderer.push(`<button></button>`);
}