import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 1;

	$$renderer.push(`<div></div> <button>increment</button>`);
}