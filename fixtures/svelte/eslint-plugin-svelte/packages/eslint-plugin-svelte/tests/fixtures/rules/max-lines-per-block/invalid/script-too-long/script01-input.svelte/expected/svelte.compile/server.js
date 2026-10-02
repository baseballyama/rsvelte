import * as $ from 'svelte/internal/server';

export default function Script01_input($$renderer) {
	let count = 0;
	let name = 'World';

	function increment() {
		count++;
	}

	$$renderer.push(`<h1>Hello World</h1>`);
}