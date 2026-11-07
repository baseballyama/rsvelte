import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const message = `call +636-555-3226 now`;

	$$renderer.push(`<h1>call +636-555-3226 now<span>!</span></h1>`);
}