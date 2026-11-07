import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let playbackRate = 0.5;

	$$renderer.push(`<audio></audio> <button>increment</button>`);
}