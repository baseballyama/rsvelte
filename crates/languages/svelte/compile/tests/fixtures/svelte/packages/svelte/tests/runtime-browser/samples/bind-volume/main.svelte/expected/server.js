import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let volume = 0.1;

	$$renderer.push(`<audio></audio> <button>increment</button>`);
}