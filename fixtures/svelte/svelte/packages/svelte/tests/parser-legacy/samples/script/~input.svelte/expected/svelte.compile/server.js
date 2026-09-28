import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let name = 'world';

	$$renderer.push(`<h1>Hello world!</h1>`);
}