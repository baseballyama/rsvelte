import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let muted = false;

	$$renderer.push(`<audio></audio> <button>toggle</button>`);
}