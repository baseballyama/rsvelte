import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let h1 = 'test';

	$$renderer.push(`<h1>test</h1>`);
}