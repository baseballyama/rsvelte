import * as $ from 'svelte/internal/server';

export default function Hello_world01_input($$renderer) {
	let name = 'world';

	$$renderer.push(`<h1>Hello world!</h1>`);
}