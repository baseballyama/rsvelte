import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo;

	$$renderer.push(`<canvas></canvas>`);
}