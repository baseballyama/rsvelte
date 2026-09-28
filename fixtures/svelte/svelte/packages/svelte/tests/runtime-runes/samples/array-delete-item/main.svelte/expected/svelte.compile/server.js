import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const arr = [0, 1, 2];

	$$renderer.push(`<button>del</button>`);
}