import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const ctx = 'world';

	$$renderer.push(`<h1>Hello world!</h1>`);
}