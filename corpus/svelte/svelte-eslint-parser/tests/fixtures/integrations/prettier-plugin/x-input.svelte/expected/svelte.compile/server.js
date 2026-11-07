import * as $ from 'svelte/internal/server';

export default function X_input($$renderer) {
	let value = "Hello";

	$$renderer.push(`<div>Hello</div>`);
}